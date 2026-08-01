import { Platform } from 'react-native';

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

/**
 * Normalize asset photo URLs from the API so the device can load them.
 * Handles relative paths and localhost APP_URL mistakes on the server.
 */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (
        API_BASE &&
        (parsed.hostname === 'localhost' ||
          parsed.hostname === '127.0.0.1' ||
          parsed.hostname === '0.0.0.0')
      ) {
        const api = new URL(API_BASE);
        parsed.protocol = api.protocol;
        parsed.host = api.host;
        return parsed.toString();
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  if (!API_BASE) return trimmed;

  let path = trimmed.replace(/^\/+/, '');
  if (!path.startsWith('storage/')) {
    path = `storage/${path}`;
  }
  return `${API_BASE}/${path}`;
}

export function mediaSource(url?: string | null) {
  const uri = resolveMediaUrl(url);
  if (!uri) return null;
  return {
    uri,
    ...(Platform.OS === 'android' ? { cache: 'force-cache' as const } : {}),
  };
}
