import React, { useState } from 'react';
import {
  FileText,
  Lock,
  Download,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { ImageInfo, EncodedResult } from '../types';
import { ImageUploader } from './ImageUploader';
import { encodeImageWithStego, downloadFile, formatBytes } from '../utils/imageProcessor';
import { calculateCapacity } from '../utils/steganography';

interface EncodePanelProps {
  onTransferToDecode: (dataUrl: string, name: string) => void;
  onOpenCompare: (orig: string, stego: string, w: number, h: number) => void;
}

const MESSAGE_TEMPLATES = [
  {
    label: 'Mật khẩu & Tài khoản',
    text: 'Tài khoản: admin_master\nMật khẩu: Vault#9928@Secure!\nMã khôi phục 2FA: 8742-9901-3412',
  },
  {
    label: 'Lời nhắn bí mật',
    text: 'Xin chào! Bức ảnh này chứa một bức thư mật gửi riêng cho bạn. Hẹn gặp lúc 19:30 tại quán quen nhé! ✨',
  },
  {
    label: 'Bản quyền số',
    text: 'Bản quyền thuộc về © Nguyễn Xuân Thái - 2026. Mọi hành vi sao chép không xin phép đều bị nghiêm cấm.',
  },
];

export const EncodePanel: React.FC<EncodePanelProps> = ({
  onTransferToDecode,
  onOpenCompare,
}) => {
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [message, setMessage] = useState<string>('');
  const [usePassword, setUsePassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<EncodedResult | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Capacity calculation
  const capacity = selectedImage
    ? calculateCapacity(selectedImage.width, selectedImage.height)
    : null;

  const messageByteSize = new TextEncoder().encode(message).length;
  const isOverCapacity = capacity ? messageByteSize > capacity.maxPayloadBytes : false;
  const capacityPercent = capacity && capacity.maxPayloadBytes > 0
    ? Math.min(100, Math.round((messageByteSize / capacity.maxPayloadBytes) * 100))
    : 0;

  const handleEncode = async () => {
    if (!selectedImage) {
      setErrorMsg('Vui lòng chọn hoặc tải lên một hình ảnh trước.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Vui lòng nhập nội dung thông điệp cần chèn vào ảnh.');
      return;
    }
    if (usePassword && !password.trim()) {
      setErrorMsg('Bạn đã bật chế độ bảo vệ bằng mật khẩu, vui lòng nhập mật khẩu.');
      return;
    }
    if (isOverCapacity) {
      setErrorMsg('Nội dung quá lớn so với sức chứa của ảnh này. Hãy chọn ảnh có độ phân giải cao hơn hoặc rút ngắn nội dung.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const startTime = performance.now();
      const encoded = await encodeImageWithStego(
        selectedImage.dataUrl,
        message,
        usePassword ? password.trim() : undefined
      );
      const executionTime = Math.round(performance.now() - startTime);

      // Estimate byte size
      const approxBytes = Math.round((encoded.dataUrl.length * 3) / 4);
      const outputName = selectedImage.name.replace(/\.[^/.]+$/, '') + '_stego.png';

      setResult({
        dataUrl: encoded.dataUrl,
        originalDataUrl: selectedImage.dataUrl,
        fileName: outputName,
        width: encoded.width,
        height: encoded.height,
        sizeBytes: approxBytes,
        messageLength: message.length,
        isEncrypted: usePassword && password.trim().length > 0,
        timestamp: Date.now(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg('Đã có lỗi xảy ra khi xử lý: ' + msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    downloadFile(result.dataUrl, result.fileName);
  };

  const handleTransfer = () => {
    if (!result) return;
    onTransferToDecode(result.dataUrl, result.fileName);
  };

  const handleReset = () => {
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Panel title banner */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-linear-to-r from-indigo-50/70 via-slate-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Khung 1: Chèn Thông Điệp Vào Hình Ảnh
            </h2>
            <p className="text-xs text-slate-500">
              Tải ảnh lên, nhập văn bản bí mật, mã hóa &amp; tải ảnh PNG về máy
            </p>
          </div>
        </div>

        {result && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors cursor-pointer"
          >
            + Chèn ảnh mới
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Step 1: Upload */}
        <ImageUploader
          label="Bước 1: Chọn hình ảnh từ máy tính hoặc dùng ảnh mẫu"
          sublabel="Ảnh càng lớn (độ phân giải cao) thì sức chứa văn bản càng nhiều"
          currentImage={selectedImage}
          onImageSelected={(info) => {
            setSelectedImage(info);
            setResult(null);
            setErrorMsg(null);
          }}
          onClearImage={() => {
            setSelectedImage(null);
            setResult(null);
          }}
          showCapacity={true}
        />

        {/* Step 2: Message Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="secret-message-input"
              className="text-sm font-semibold text-slate-800 flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              Bước 2: Nhập nội dung thông điệp cần giấu
            </label>

            {/* Quick templates */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Mẫu gợi ý:</span>
              {MESSAGE_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(tmpl.text)}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              id="secret-message-input"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              rows={5}
              placeholder="Nhập thông điệp bí mật tại đây... (Hỗ trợ tiếng Việt đầy đủ dấu, emoji 🔐✨, số tài khoản, link, văn bản dài...)"
              className={`w-full p-3.5 rounded-xl border text-sm text-slate-800 bg-slate-50/40 focus:bg-white transition-all outline-hidden resize-y placeholder:text-slate-400 ${
                isOverCapacity
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
            />
          </div>

          {/* Character & Byte Counter Bar */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">
                {message.length.toLocaleString('vi-VN')} ký tự
              </span>
              <span>•</span>
              <span>{formatBytes(messageByteSize)}</span>
              {capacity && (
                <>
                  <span>/</span>
                  <span className="text-slate-600">
                    tối đa {formatBytes(capacity.maxPayloadBytes)}
                  </span>
                </>
              )}
            </div>

            {capacity && (
              <div className="flex items-center gap-2">
                <div className="w-24 sm:w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverCapacity
                        ? 'bg-rose-500'
                        : capacityPercent > 80
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, capacityPercent || 1)}%` }}
                  />
                </div>
                <span className={isOverCapacity ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                  {capacityPercent}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Password Option */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={usePassword}
                onChange={(e) => setUsePassword(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                Khóa thông điệp bằng Mật khẩu bí mật (Mã hóa chuẩn AES-GCM 256-bit)
              </span>
            </label>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
              Tùy chọn nâng cao
            </span>
          </div>

          {usePassword && (
            <div className="pt-2 border-t border-slate-200/80 space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu bảo vệ thông điệp..."
                  className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                🔒 Khi bật mật khẩu, người nhận bắt buộc phải nhập đúng mật khẩu này ở Khung 2 mới có thể đọc được nội dung.
              </p>
            </div>
          )}
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        {!result ? (
          <button
            type="button"
            disabled={isProcessing || !selectedImage || !message.trim() || isOverCapacity}
            onClick={handleEncode}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              isProcessing || !selectedImage || !message.trim() || isOverCapacity
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white shadow-indigo-200'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang giấu thông điệp vào từng pixel...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Tiến hành Chèn thông điệp vào hình ảnh</span>
              </>
            )}
          </button>
        ) : (
          /* RESULT BLOCK */
          <div className="bg-linear-to-b from-emerald-50/60 to-white rounded-2xl border-2 border-emerald-500/40 p-4 sm:p-5 space-y-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Chèn thông điệp thành công!</h4>
                  <p className="text-xs text-emerald-700">
                    Ảnh đã được mã hóa bit LSB hoàn tất và giữ nguyên 100% độ nét ban đầu.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {result.isEncrypted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                    <Lock className="w-3 h-3" /> Đã mã hóa AES-256
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Chuẩn LSB
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail and preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900 rounded-xl p-3 text-white">
              <div className="relative aspect-4/3 bg-black/40 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={result.dataUrl}
                  alt="Ảnh đã chèn thông điệp"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex flex-col justify-between py-1 text-xs space-y-2">
                <div className="space-y-1.5 text-slate-300">
                  <p className="font-semibold text-white truncate" title={result.fileName}>
                    {result.fileName}
                  </p>
                  <p>Kích thước: {result.width} &times; {result.height} px</p>
                  <p>Dung lượng file: {formatBytes(result.sizeBytes)}</p>
                  <p>Độ dài thông điệp: {result.messageLength} ký tự</p>
                  <p className="text-slate-400 text-[11px]">
                    Thời gian tạo: {new Date(result.timestamp).toLocaleTimeString('vi-VN')} {new Date(result.timestamp).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenCompare(
                      result.originalDataUrl,
                      result.dataUrl,
                      result.width,
                      result.height
                    )
                  }
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer border border-slate-700"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>So sánh với ảnh gốc (Diff Inspector)</span>
                </button>
              </div>
            </div>

            {/* Actions: Download & Transfer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleDownload}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải ảnh về máy (.PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleTransfer}
                className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                <span>Chuyển sang Khung 2 để giải mã</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* PNG preservation warning */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              ⚠️ <strong>Lưu ý quan trọng:</strong> File đã được lưu ở định dạng <strong>.PNG không nén</strong>. Khi gửi ảnh này cho bạn bè, hãy gửi dưới dạng <em>"Tài liệu / File gốc"</em> để tránh bị các ứng dụng nhắn tin nén mất dữ liệu.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
