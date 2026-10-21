import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, RefreshCw, X } from 'lucide-react';
import { ImageInfo } from '../types';
import { SAMPLE_IMAGES } from '../utils/sampleImages';
import { calculateCapacity } from '../utils/steganography';
import { formatBytes } from '../utils/imageProcessor';

interface ImageUploaderProps {
  label: string;
  sublabel?: string;
  currentImage: ImageInfo | null;
  onImageSelected: (info: ImageInfo) => void;
  onClearImage: () => void;
  showCapacity?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  sublabel,
  currentImage,
  onImageSelected,
  onClearImage,
  showCapacity = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP, JPEG).');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onImageSelected({
          file,
          dataUrl,
          name: file.name,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          sizeBytes: file.size,
        });
        setIsLoading(false);
      };
      img.onerror = () => {
        alert('Không thể đọc dữ liệu ảnh. Vui lòng thử lại với ảnh khác.');
        setIsLoading(false);
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      alert('Lỗi đọc file từ máy tính.');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handlePickSample = (sample: typeof SAMPLE_IMAGES[0]) => {
    setIsLoading(true);
    const dataUrl = sample.generateDataUrl();
    const img = new Image();
    img.onload = () => {
      // Estimate byte size from dataURL base64
      const approxBytes = Math.round((dataUrl.length * 3) / 4);
      onImageSelected({
        dataUrl,
        name: `${sample.name}.png`,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        sizeBytes: approxBytes,
      });
      setIsLoading(false);
    };
    img.src = dataUrl;
  };

  const capacity = currentImage
    ? calculateCapacity(currentImage.width, currentImage.height)
    : null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            {label}
          </label>
          {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
        </div>

        {currentImage && (
          <button
            type="button"
            onClick={onClearImage}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Đổi ảnh khác
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        aria-label={label}
      />

      {!currentImage ? (
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99]'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
              {isLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>
            <p className="text-sm font-medium text-slate-800">
              Kéo thả hình ảnh vào đây hoặc <span className="text-indigo-600 font-semibold underline underline-offset-2">Chọn file từ máy tính</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Hỗ trợ PNG, JPG, JPEG, WEBP (Tự động chuyển đổi sang PNG không nén để bảo toàn dữ liệu)
            </p>
          </div>

          {/* Quick sample images */}
          <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Chưa có ảnh sẵn? Nhấn chọn ảnh mẫu để thử nghiệm nhanh:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handlePickSample(sample)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs text-left transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate group-hover:text-indigo-600">
                      {sample.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{sample.tag}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xs">
          <div className="relative group max-h-64 flex items-center justify-center bg-black/40">
            <img
              src={currentImage.dataUrl}
              alt={currentImage.name}
              className="max-h-60 w-auto object-contain p-2"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md backdrop-blur flex items-center gap-1 font-medium cursor-pointer transition-colors"
                title="Thay ảnh khác"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Đổi ảnh
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-950 text-slate-200 text-xs border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="font-medium text-slate-100 truncate max-w-[200px]" title={currentImage.name}>
                {currentImage.name}
              </span>
              <span className="text-slate-400">
                {currentImage.width} &times; {currentImage.height} px
              </span>
              <span className="text-slate-400">
                {formatBytes(currentImage.sizeBytes)}
              </span>
            </div>

            {showCapacity && capacity && (
              <div className="text-emerald-400 font-medium">
                Sức chứa tối đa: ~{formatBytes(capacity.maxPayloadBytes)} ({capacity.maxCharactersEst.toLocaleString('vi-VN')} ký tự)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
