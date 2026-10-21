export interface ImageInfo {
  file?: File;
  dataUrl: string;
  name: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface EncodedResult {
  dataUrl: string;
  originalDataUrl: string;
  fileName: string;
  width: number;
  height: number;
  sizeBytes: number;
  messageLength: number;
  isEncrypted: boolean;
  timestamp: number;
}
