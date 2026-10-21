import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Copy,
  Check,
  Download,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  HelpCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { ImageInfo } from '../types';
import { ImageUploader } from './ImageUploader';
import { decodeImageWithStego, quickProbeImage } from '../utils/imageProcessor';
import { DecodeResult } from '../utils/steganography';

interface DecodePanelProps {
  incomingImage?: { dataUrl: string; name: string } | null;
  onClearIncomingImage?: () => void;
}

export const DecodePanel: React.FC<DecodePanelProps> = ({
  incomingImage,
  onClearIncomingImage,
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [decodeResult, setDecodeResult] = useState<DecodeResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [probeInfo, setProbeInfo] = useState<{
    isValid: boolean;
    isEncrypted?: boolean;
    timestamp?: number;
  } | null>(null);

  // If an incoming image was forwarded from Encode tab, set it immediately
  useEffect(() => {
    if (incomingImage) {
      const img = new Image();
      img.onload = () => {
        const info: ImageInfo = {
          dataUrl: incomingImage.dataUrl,
          name: incomingImage.name,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          sizeBytes: Math.round((incomingImage.dataUrl.length * 3) / 4),
        };
        setSelectedImage(info);
        setDecodeResult(null);
        setPassword('');
        // Auto trigger probe and decode
        runQuickProbe(incomingImage.dataUrl);
      };
      img.src = incomingImage.dataUrl;

      if (onClearIncomingImage) {
        onClearIncomingImage();
      }
    }
  }, [incomingImage, onClearIncomingImage]);

  const runQuickProbe = async (dataUrl: string) => {
    const probe = await quickProbeImage(dataUrl);
    setProbeInfo(probe);
  };

  const handleImageSelected = async (info: ImageInfo) => {
    setSelectedImage(info);
    setDecodeResult(null);
    setPassword('');
    runQuickProbe(info.dataUrl);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setDecodeResult(null);
    setProbeInfo(null);
    setPassword('');
  };

  const handleDecode = async (usePwd?: string) => {
    if (!selectedImage) return;

    setIsChecking(true);
    try {
      const pwdToUse = usePwd !== undefined ? usePwd : password.trim();
      const res = await decodeImageWithStego(
        selectedImage.dataUrl,
        pwdToUse ? pwdToUse : undefined
      );
      setDecodeResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDecodeResult({
        success: false,
        error: 'Lỗi khi giải mã: ' + msg,
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopy = async () => {
    if (!decodeResult?.text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(decodeResult.text);
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch {
      // Fallback for iframes or permission-restricted environments
      const textArea = document.createElement('textarea');
      textArea.value = decodeResult.text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch {
        // Fallback silently
      }
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    if (!decodeResult?.text) return;
    const blob = new Blob([decodeResult.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thong_diep_giai_ma_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const wordCount = decodeResult?.text
    ? decodeResult.text.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Panel title banner */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-linear-to-r from-violet-50/70 via-slate-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Khung 2: Kiểm Tra &amp; Trích Xuất Thông Điệp Từ Ảnh
            </h2>
            <p className="text-xs text-slate-500">
              Tải lên hình ảnh nghi vấn để phát hiện và đọc nội dung văn bản ẩn bên trong
            </p>
          </div>
        </div>

        {selectedImage && (
          <button
            type="button"
            onClick={handleClearImage}
            className="text-xs font-semibold text-slate-600 hover:text-violet-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:border-violet-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Kiểm tra ảnh khác
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Step 1: Upload */}
        <ImageUploader
          label="Bước 1: Chọn hình ảnh cần kiểm tra"
          sublabel="Tải ảnh PNG/JPG từ máy tính bạn muốn kiểm tra xem có thông điệp ẩn hay không"
          currentImage={selectedImage}
          onImageSelected={handleImageSelected}
          onClearImage={handleClearImage}
          showCapacity={false}
        />

        {/* Quick status pill if probed */}
        {selectedImage && probeInfo && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
              probeInfo.isValid
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              {probeInfo.isValid ? (
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span>
                {probeInfo.isValid
                  ? '🔍 Tín hiệu khả nghi: Phát hiện cấu trúc chữ ký Stego ẩn trong ảnh!'
                  : 'Sẵn sàng kiểm tra pixel ảnh để tìm thông điệp.'}
              </span>
            </div>

            {probeInfo.isValid && probeInfo.isEncrypted && (
              <span className="font-semibold text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Lock className="w-3 h-3" /> Khóa bằng Mật khẩu
              </span>
            )}
          </div>
        )}

        {/* Action Button: Check & Extract */}
        {selectedImage && !decodeResult && (
          <button
            type="button"
            disabled={isChecking}
            onClick={() => handleDecode()}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-700 active:scale-[0.99] text-white shadow-md shadow-violet-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isChecking ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang quét các bit LSB và trích xuất dữ liệu...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Kiểm tra &amp; Trích xuất thông điệp ngay</span>
              </>
            )}
          </button>
        )}

        {/* PASSWORD REQUIRED FORM */}
        {decodeResult && !decodeResult.success && decodeResult.requiresPassword && (
          <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-5 space-y-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-900">
                  Ảnh này đã được bảo vệ bằng Mật Khẩu
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Thông điệp bên trong được mã hóa AES-256. Vui lòng nhập mật khẩu chính xác từ người gửi để mở khóa.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDecode(password);
                  }}
                  placeholder="Nhập mật khẩu giải mã..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-amber-300 bg-white text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-hidden"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                disabled={isChecking || !password.trim()}
                onClick={() => handleDecode(password)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Unlock className="w-4 h-4" />
                <span>Mở khóa &amp; Giải mã thông điệp</span>
              </button>
            </div>
          </div>
        )}

        {/* ERROR OR NO MESSAGE FOUND */}
        {decodeResult && !decodeResult.success && !decodeResult.requiresPassword && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">
                  {decodeResult.error || 'Không tìm thấy thông điệp ẩn trong ảnh này'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thuật toán quét các bit LSB của các kênh màu Red, Green, Blue nhưng không phát hiện chữ ký dữ liệu Stego hợp lệ.
                </p>
              </div>
            </div>

            {/* Checklist why it might fail */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                Các nguyên nhân có thể xảy ra:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Bức ảnh này là ảnh thông thường, chưa từng được chèn thông điệp.</li>
                <li>
                  Ảnh bị nén mất dữ liệu khi gửi qua mạng xã hội (Zalo, Facebook Messenger thường nén ảnh sang JPEG làm mất các bit ẩn).
                </li>
                <li>Ảnh đã bị chỉnh sửa, cắt xén (crop), hoặc đổi đuôi định dạng sau khi chèn mã.</li>
                {decodeResult.isEncrypted && (
                  <li className="text-rose-600 font-semibold">
                    Mật khẩu bạn vừa nhập chưa chính xác. Vui lòng kiểm tra lại.
                  </li>
                )}
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDecodeResult(null);
                  setPassword('');
                }}
                className="w-full py-2 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 font-semibold text-xs text-slate-700 transition-colors cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* SUCCESSFUL EXTRACTION */}
        {decodeResult && decodeResult.success && decodeResult.text && (
          <div className="bg-linear-to-b from-emerald-50/70 to-white rounded-2xl border-2 border-emerald-500/50 p-5 space-y-4 shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5 text-emerald-900">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Trích xuất thông điệp thành công!</h4>
                  <p className="text-xs text-emerald-700">
                    Đã đọc nguyên vẹn nội dung văn bản được ẩn giấu trong bức ảnh.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {decodeResult.isEncrypted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                    <Lock className="w-3 h-3" /> Đã mở khóa AES-256
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3" /> LSB Stego Hợp lệ
                  </span>
                )}
              </div>
            </div>

            {/* Metadata bar */}
            <div className="flex flex-wrap items-center gap-3 py-2 px-3 bg-white/80 rounded-xl border border-emerald-200/70 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  <strong>{decodeResult.text.length.toLocaleString('vi-VN')}</strong> ký tự
                </span>
              </div>
              <span>•</span>
              <div>
                <strong>{wordCount.toLocaleString('vi-VN')}</strong> từ
              </div>
              {decodeResult.timestamp && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Được nhúng lúc:{' '}
                      {new Date(decodeResult.timestamp).toLocaleTimeString('vi-VN')}{' '}
                      {new Date(decodeResult.timestamp).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Message display textarea */}
            <div className="relative group">
              <label htmlFor="decoded-message-output" className="sr-only">Nội dung thông điệp trích xuất</label>
              <textarea
                id="decoded-message-output"
                readOnly
                value={decodeResult.text}
                rows={Math.min(12, Math.max(5, decodeResult.text.split('\n').length + 1))}
                className="w-full p-4 rounded-xl border border-emerald-300 bg-white font-sans text-sm text-slate-900 leading-relaxed shadow-inner outline-hidden resize-y select-all"
              />
            </div>

            {/* Actions: Copy & Save */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 hover:border-slate-400 flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Đã sao chép vào bộ nhớ tạm!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-indigo-600" />
                    <span>Sao chép thông điệp</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadText}
                className="py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-violet-200 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Lưu thông điệp thành file .txt</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
