import type { PaletteId, PartnerId } from '../types/app';

export interface InvitePayload {
  t: string; // GitHub PAT
  g: string; // Gist ID
  a: PartnerId; // Target partner account
  p1: string;
  p2: string;
  pal?: PaletteId;
}

interface EncryptedEnvelope {
  v: 2;
  enc: true;
  salt: string;
  iv: string;
  ct: string;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(b64: string): Uint8Array {
  let str = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 120000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encodes an invite payload into a Hash-only URL (#invite=...).
 * Never places tokens in URL query strings (?invite=) so they never leak to server/proxy logs or Referer headers.
 * When `pin` is provided, encrypts the payload with AES-256-GCM + PBKDF2 so the token is unreadable without the PIN.
 */
export async function createMagicInviteUrl(payload: InvitePayload, pin?: string): Promise<string> {
  const baseUrl = window.location.origin + window.location.pathname;
  const trimmedPin = (pin || '').trim();

  if (trimmedPin && typeof crypto !== 'undefined' && crypto.subtle) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(trimmedPin, salt);
    const plainBytes = new TextEncoder().encode(JSON.stringify(payload));
    const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plainBytes);
    const envelope: EncryptedEnvelope = {
      v: 2,
      enc: true,
      salt: bytesToBase64Url(salt),
      iv: bytesToBase64Url(iv),
      ct: bytesToBase64Url(new Uint8Array(cipherBuffer)),
    };
    const encoded = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(envelope)));
    return `${baseUrl}#invite=${encoded}`;
  }

  const encoded = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  return `${baseUrl}#invite=${encoded}`;
}

export type ParsedInviteResult =
  | { status: 'none' }
  | { status: 'ready'; payload: InvitePayload }
  | { status: 'needs_pin'; rawCode: string }
  | { status: 'invalid' };

/**
 * Extracts invite code from URL hash (#invite=...) or legacy query (?invite=...) and immediately cleans the URL bar.
 */
export function extractIncomingInviteCode(): string | null {
  let code: string | null = null;
  if (window.location.hash.includes('invite=')) {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    code = hashParams.get('invite');
  }
  if (!code && window.location.search.includes('invite=')) {
    const searchParams = new URLSearchParams(window.location.search);
    code = searchParams.get('invite');
  }
  if (code && window.history?.replaceState) {
    window.history.replaceState(null, '', window.location.pathname);
  }
  return code;
}

export function inspectInviteCode(code: string): ParsedInviteResult {
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(code));
    const parsed = JSON.parse(json) as Partial<InvitePayload & EncryptedEnvelope>;
    if (parsed && parsed.enc === true && parsed.salt && parsed.iv && parsed.ct) {
      return { status: 'needs_pin', rawCode: code };
    }
    if (parsed && typeof parsed.t === 'string' && typeof parsed.g === 'string') {
      return {
        status: 'ready',
        payload: {
          t: parsed.t,
          g: parsed.g,
          a: parsed.a === 'p1' ? 'p1' : 'p2',
          p1: typeof parsed.p1 === 'string' ? parsed.p1 : 'نفر اول',
          p2: typeof parsed.p2 === 'string' ? parsed.p2 : 'نفر دوم',
          pal: parsed.pal,
        },
      };
    }
    return { status: 'invalid' };
  } catch {
    return { status: 'invalid' };
  }
}

export async function decryptInviteCode(code: string, pin: string): Promise<InvitePayload | null> {
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(code));
    const envelope = JSON.parse(json) as EncryptedEnvelope;
    if (!envelope.enc || !envelope.salt || !envelope.iv || !envelope.ct) return null;
    const salt = base64UrlToBytes(envelope.salt);
    const iv = base64UrlToBytes(envelope.iv);
    const ct = base64UrlToBytes(envelope.ct);
    const key = await deriveKey(pin.trim(), salt);
    const plainBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      key,
      ct.buffer as ArrayBuffer
    );
    const parsed = JSON.parse(new TextDecoder().decode(plainBuf)) as Partial<InvitePayload>;
    if (!parsed.t || !parsed.g) return null;
    return {
      t: parsed.t,
      g: parsed.g,
      a: parsed.a === 'p1' ? 'p1' : 'p2',
      p1: typeof parsed.p1 === 'string' ? parsed.p1 : 'نفر اول',
      p2: typeof parsed.p2 === 'string' ? parsed.p2 : 'نفر دوم',
      pal: parsed.pal,
    };
  } catch {
    return null;
  }
}
