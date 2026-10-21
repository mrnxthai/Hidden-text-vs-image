import {
  buildStegoPackage,
  embedBytesInPixels,
  extractMessageFromPixels,
  probeStegoHeader,
  DecodeResult,
  calculateCapacity,
} from './steganography';

export interface ProcessedImageData {
  width: number;
  height: number;
  dataUrl: string;
}

/**
 * Loads image from File or Data URL into an HTMLImageElement
 */
export function loadImageElement(source: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Không thể tải file hình ảnh: ' + err));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Lỗi khi đọc file'));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Embeds a message into an image and returns the stego image as a PNG data URL.
 */
export async function encodeImageWithStego(
  imageSource: string | File,
  message: string,
  password?: string
): Promise<{
  dataUrl: string;
  width: number;
  height: number;
  bytesUsed: number;
  maxCapacityBytes: number;
}> {
  const img = await loadImageElement(imageSource);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Không thể khởi tạo Canvas 2D context');

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);
  const pkg = await buildStegoPackage(message, password);

  embedBytesInPixels(imageData.data, pkg);

  ctx.putImageData(imageData, 0, 0);

  const dataUrl = canvas.toDataURL('image/png');
  const capacity = calculateCapacity(width, height);

  return {
    dataUrl,
    width,
    height,
    bytesUsed: pkg.length,
    maxCapacityBytes: capacity.maxPayloadBytes,
  };
}

/**
 * Inspects and extracts hidden message from an image.
 */
export async function decodeImageWithStego(
  imageSource: string | File,
  password?: string
): Promise<DecodeResult & { width: number; height: number }> {
  const img = await loadImageElement(imageSource);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Không thể khởi tạo Canvas context');

  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);
  const result = await extractMessageFromPixels(imageData.data, password);

  return {
    ...result,
    width,
    height,
  };
}

/**
 * Quickly checks if an image has a valid Stego header without full decryption.
 */
export async function quickProbeImage(
  imageSource: string | File
): Promise<{
  isValid: boolean;
  isEncrypted?: boolean;
  timestamp?: number;
  payloadLength?: number;
}> {
  try {
    const img = await loadImageElement(imageSource);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { isValid: false };

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const probe = probeStegoHeader(imageData.data);

    return {
      isValid: probe.isValid,
      isEncrypted: probe.isEncrypted,
      timestamp: probe.timestamp,
      payloadLength: probe.payloadLength,
    };
  } catch {
    return { isValid: false };
  }
}

/**
 * Generates an amplified difference map between original and stego image
 * (amplifying delta by 100x into bright red/cyan pixels) to show where data resides.
 */
export async function generateDiffMap(
  originalSource: string,
  stegoSource: string
): Promise<string> {
  const [imgOrig, imgStego] = await Promise.all([
    loadImageElement(originalSource),
    loadImageElement(stegoSource),
  ]);

  const width = imgOrig.naturalWidth;
  const height = imgOrig.naturalHeight;

  const canvasOrig = document.createElement('canvas');
  canvasOrig.width = width;
  canvasOrig.height = height;
  const ctxOrig = canvasOrig.getContext('2d');
  if (!ctxOrig) return '';
  ctxOrig.drawImage(imgOrig, 0, 0);
  const dataOrig = ctxOrig.getImageData(0, 0, width, height).data;

  const canvasStego = document.createElement('canvas');
  canvasStego.width = width;
  canvasStego.height = height;
  const ctxStego = canvasStego.getContext('2d');
  if (!ctxStego) return '';
  ctxStego.drawImage(imgStego, 0, 0);
  const dataStego = ctxStego.getImageData(0, 0, width, height).data;

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const ctxDiff = diffCanvas.getContext('2d');
  if (!ctxDiff) return '';
  const diffImageData = ctxDiff.createImageData(width, height);
  const diffData = diffImageData.data;

  for (let i = 0; i < dataOrig.length; i += 4) {
    const diffR = Math.abs(dataOrig[i] - dataStego[i]);
    const diffG = Math.abs(dataOrig[i + 1] - dataStego[i + 1]);
    const diffB = Math.abs(dataOrig[i + 2] - dataStego[i + 2]);

    if (diffR > 0 || diffG > 0 || diffB > 0) {
      // Highlight modified pixels bright cyan / red
      diffData[i] = diffR > 0 ? 255 : 0;
      diffData[i + 1] = diffG > 0 ? 255 : 200;
      diffData[i + 2] = diffB > 0 ? 255 : 0;
      diffData[i + 3] = 255;
    } else {
      // Dark grayscale background
      const avg = Math.floor((dataOrig[i] + dataOrig[i + 1] + dataOrig[i + 2]) / 3);
      diffData[i] = Math.floor(avg * 0.15);
      diffData[i + 1] = Math.floor(avg * 0.15);
      diffData[i + 2] = Math.floor(avg * 0.15);
      diffData[i + 3] = 255;
    }
  }

  ctxDiff.putImageData(diffImageData, 0, 0);
  return diffCanvas.toDataURL('image/png');
}

/**
 * Downloads a data URL as a file
 */
export function downloadFile(dataUrl: string, fileName: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Format bytes nicely
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
