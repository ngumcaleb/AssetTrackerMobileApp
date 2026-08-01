/**
 * Normalize a scanned QR/barcode payload into a lookup value the API understands.
 * Web-printed labels encode the asset show URL (…/assets/{id}), not the tag.
 */
export function normalizeScanPayload(raw: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';

  // https://host/assets/12 or http://host/assets/12/edit
  const urlMatch = trimmed.match(/\/assets\/(\d+)(?:\/|$|\?|#)/i);
  if (urlMatch?.[1]) {
    return urlMatch[1];
  }

  // assettracker://asset/AST-2026-0001 or …/asset/12
  const deepMatch = trimmed.match(/(?:assettracker:\/\/|\/)(?:asset|assets)\/([A-Za-z0-9\-]+)/i);
  if (deepMatch?.[1]) {
    return deepMatch[1];
  }

  // Full URL whose path ends with a tag-like segment
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const u = new URL(trimmed);
      const parts = u.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last) return decodeURIComponent(last);
    }
  } catch {
    // ignore invalid URL
  }

  // Strip surrounding quotes / BOM / zero-width chars from some scanners
  return trimmed
    .replace(/^[\uFEFF\u200B\u200C\u200D"']+|[\uFEFF\u200B\u200C\u200D"']+$/g, '')
    .trim();
}
