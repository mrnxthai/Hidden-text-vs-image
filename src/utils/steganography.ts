/**
 * Steganography utility functions for embedding and extracting UTF-8 messages
 * into image pixel data using Least Significant Bit (LSB) encoding.
 * 
 * Supports optional AES-GCM password encryption via Web Crypto API.
 */

// Magic identifier: 'S', 'T', 'E', 'G' (0x53, 0x54, 0x45, 0x47)
export const MAGIC_HEADER = [0x53, 0x54, 0x45, 0x47];
export const PROTOCOL_VERSION = 1;

export interface StegoMetadata {
  isEncrypted: boolean;
  payloadLength: number;
  timestamp?: number;
}

export interface DecodeResult {
  success: boolean;
  text?: string;
  isEncrypted?: boolean;
  timestamp?: number;
  error?: string;
  requiresPassword?: boolean;
}

// Convert string to UTF-8 Uint8Array
export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert UTF-8 Uint8Array to string
export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/**
 * Calculates max byte capacity for given image dimensions (using 1 bit per RGB channel).
 * Each pixel has 3 usable color channels (R, G, B) = 3 bits.
 */
export function calculateCapacity(width: number, height: number): {
  totalBits: number;
  maxPayloadBytes: number;
  maxCharactersEst: number;
} {
  const totalPixels = width * height;
  const totalBits = totalPixels * 3; // R, G, B
  const totalBytes = Math.floor(totalBits / 8);
  // Header overhead:
  // 4 bytes MAGIC + 1 byte VERSION + 1 byte FLAGS + 8 bytes TIMESTAMP + 4 bytes LENGTH = 18 bytes
  // If encrypted: + 12 bytes IV + 16 bytes Auth Tag = ~46 bytes
  const overhead = 64;
  const maxPayloadBytes = Math.max(0, totalBytes - overhead);
  return {
    totalBits,
    maxPayloadBytes,
    maxCharactersEst: Math.floor(maxPayloadBytes / 1.5), // average UTF-8 char is 1-2 bytes
  };
}

/**
 * Derives an AES-GCM CryptoKey from a password and salt using PBKDF2.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts payload bytes with password using AES-GCM.
 * Returns { ciphertext, salt, iv }
 */
export async function encryptPayload(
  data: Uint8Array,
  password: string
): Promise<{ encryptedBytes: Uint8Array; salt: Uint8Array; iv: Uint8Array }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    data as unknown as BufferSource
  );

  return {
    encryptedBytes: new Uint8Array(ciphertextBuffer),
    salt,
    iv,
  };
}

/**
 * Decrypts AES-GCM ciphertext using password, salt, and iv.
 */
export async function decryptPayload(
  ciphertext: Uint8Array,
  password: string,
  salt: Uint8Array,
  iv: Uint8Array
): Promise<Uint8Array> {
  const key = await deriveKey(password, salt);
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    ciphertext as unknown as BufferSource
  );
  return new Uint8Array(decryptedBuffer);
}

/**
 * Assembles complete binary package:
 * [0..3] MAGIC ("STEG")
 * [4] VERSION (0x01)
 * [5] FLAGS (bit 0: isEncrypted)
 * [6..13] TIMESTAMP (8 bytes Uint64 BigEndian)
 * [14..17] LENGTH (4 bytes Uint32 BigEndian of data)
 * If encrypted:
 *   [18..33] SALT (16 bytes)
 *   [34..45] IV (12 bytes)
 *   [46..] CIPHERTEXT (LENGTH bytes)
 * If not encrypted:
 *   [18..] RAW DATA (LENGTH bytes)
 */
export async function buildStegoPackage(
  messageText: string,
  password?: string
): Promise<Uint8Array> {
  const rawBytes = stringToBytes(messageText);
  const isEncrypted = Boolean(password && password.trim().length > 0);
  const timestamp = Date.now();

  let payloadData: Uint8Array;
  let salt: Uint8Array = new Uint8Array(0);
  let iv: Uint8Array = new Uint8Array(0);

  if (isEncrypted && password) {
    const enc = await encryptPayload(rawBytes, password);
    payloadData = enc.encryptedBytes;
    salt = enc.salt;
    iv = enc.iv;
  } else {
    payloadData = rawBytes;
  }

  const headerSize = 18; // 4 magic + 1 ver + 1 flag + 8 timestamp + 4 len
  const encryptionMetaSize = isEncrypted ? 16 + 12 : 0;
  const totalPackageSize = headerSize + encryptionMetaSize + payloadData.length;

  const pkg = new Uint8Array(totalPackageSize);
  const view = new DataView(pkg.buffer);

  // Magic
  pkg.set(MAGIC_HEADER, 0);
  // Version
  pkg[4] = PROTOCOL_VERSION;
  // Flags: bit 0: isEncrypted
  pkg[5] = isEncrypted ? 1 : 0;
  // Timestamp (BigInt 64-bit)
  view.setBigUint64(6, BigInt(timestamp), false);
  // Payload length
  view.setUint32(14, payloadData.length, false);

  let offset = 18;
  if (isEncrypted) {
    pkg.set(salt, offset);
    offset += 16;
    pkg.set(iv, offset);
    offset += 12;
  }

  pkg.set(payloadData, offset);
  return pkg;
}

/**
 * Embeds binary package into RGBA pixel array (Uint8ClampedArray).
 * Leaves Alpha channel intact.
 * Returns true if successful, throws if capacity exceeded.
 */
export function embedBytesInPixels(pixels: Uint8ClampedArray, pkg: Uint8Array): void {
  const availableBits = Math.floor(pixels.length / 4) * 3;
  const requiredBits = pkg.length * 8;

  if (requiredBits > availableBits) {
    throw new Error(
      `Dung lượng ảnh không đủ. Cần ${Math.ceil(requiredBits / 8)} bytes nhưng ảnh chỉ chứa tối đa ${Math.floor(availableBits / 8)} bytes.`
    );
  }

  let bitIndex = 0;
  for (let i = 0; i < pixels.length && bitIndex < requiredBits; i += 4) {
    // Modify R, G, B channels (leave A at pixels[i + 3])
    for (let c = 0; c < 3 && bitIndex < requiredBits; c++) {
      const byteIdx = Math.floor(bitIndex / 8);
      const bitOffset = 7 - (bitIndex % 8); // Most significant bit first
      const bit = (pkg[byteIdx] >> bitOffset) & 1;

      pixels[i + c] = (pixels[i + c] & 0xfe) | bit;
      bitIndex++;
    }
  }
}

/**
 * Reads N bytes from pixel array starting from bit offset 0.
 */
function readBytesFromPixels(pixels: Uint8ClampedArray, byteCount: number): Uint8Array {
  const result = new Uint8Array(byteCount);
  const totalBits = byteCount * 8;
  let bitIndex = 0;

  for (let i = 0; i < pixels.length && bitIndex < totalBits; i += 4) {
    for (let c = 0; c < 3 && bitIndex < totalBits; c++) {
      const bit = pixels[i + c] & 1;
      const targetByteIdx = Math.floor(bitIndex / 8);
      const bitOffset = 7 - (bitIndex % 8);
      result[targetByteIdx] |= bit << bitOffset;
      bitIndex++;
    }
  }

  return result;
}

/**
 * Probes the image pixel data to check if a valid Stego package exists.
 */
export function probeStegoHeader(pixels: Uint8ClampedArray): {
  isValid: boolean;
  version?: number;
  isEncrypted?: boolean;
  timestamp?: number;
  payloadLength?: number;
  totalPackageLength?: number;
} {
  // Read first 18 bytes (header)
  if (pixels.length < (18 * 8 / 3) * 4) {
    return { isValid: false };
  }

  const header = readBytesFromPixels(pixels, 18);

  // Check magic
  for (let i = 0; i < 4; i++) {
    if (header[i] !== MAGIC_HEADER[i]) {
      return { isValid: false };
    }
  }

  const version = header[4];
  if (version !== PROTOCOL_VERSION) {
    return { isValid: false };
  }

  const flags = header[5];
  const isEncrypted = (flags & 1) === 1;

  const view = new DataView(header.buffer);
  const timestamp = Number(view.getBigUint64(6, false));
  const payloadLength = view.getUint32(14, false);

  // Sanity check length
  const maxPossibleBytes = Math.floor((Math.floor(pixels.length / 4) * 3) / 8);
  const encryptionMetaSize = isEncrypted ? 16 + 12 : 0;
  const totalPackageLength = 18 + encryptionMetaSize + payloadLength;

  if (payloadLength <= 0 || totalPackageLength > maxPossibleBytes) {
    return { isValid: false };
  }

  return {
    isValid: true,
    version,
    isEncrypted,
    timestamp,
    payloadLength,
    totalPackageLength,
  };
}

/**
 * Extracts and decodes message from pixels.
 * If image is encrypted and password is not provided or wrong, returns requiresPassword: true or error.
 */
export async function extractMessageFromPixels(
  pixels: Uint8ClampedArray,
  password?: string
): Promise<DecodeResult> {
  const probe = probeStegoHeader(pixels);
  if (!probe.isValid || !probe.totalPackageLength) {
    return {
      success: false,
      error: 'Không tìm thấy thông điệp ẩn trong ảnh này (Ảnh chưa được chèn mã hoặc bị nén mất dữ liệu).',
    };
  }

  const isEncrypted = probe.isEncrypted ?? false;
  const timestamp = probe.timestamp;

  if (isEncrypted && (!password || password.trim().length === 0)) {
    return {
      success: false,
      isEncrypted: true,
      timestamp,
      requiresPassword: true,
      error: 'Thông điệp trong ảnh này đã được khóa bằng mật khẩu. Vui lòng nhập mật khẩu để giải mã.',
    };
  }

  // Read the full package
  const pkg = readBytesFromPixels(pixels, probe.totalPackageLength);

  let payloadOffset = 18;
  let salt = new Uint8Array(0);
  let iv = new Uint8Array(0);

  if (isEncrypted) {
    salt = pkg.slice(payloadOffset, payloadOffset + 16);
    payloadOffset += 16;
    iv = pkg.slice(payloadOffset, payloadOffset + 12);
    payloadOffset += 12;
  }

  const payloadData = pkg.slice(payloadOffset, payloadOffset + (probe.payloadLength || 0));

  let rawBytes: Uint8Array;
  if (isEncrypted) {
    try {
      rawBytes = await decryptPayload(payloadData, password!, salt, iv);
    } catch {
      return {
        success: false,
        isEncrypted: true,
        timestamp,
        error: 'Mật khẩu giải mã không chính xác hoặc dữ liệu bị hỏng.',
      };
    }
  } else {
    rawBytes = payloadData;
  }

  try {
    const text = bytesToString(rawBytes);
    return {
      success: true,
      text,
      isEncrypted,
      timestamp,
    };
  } catch {
    return {
      success: false,
      isEncrypted,
      timestamp,
      error: 'Không thể chuyển đổi dữ liệu sang định dạng văn bản UTF-8.',
    };
  }
}
