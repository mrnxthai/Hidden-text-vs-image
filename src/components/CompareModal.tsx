import React, { useEffect, useState } from 'react';
import { X, Layers, Eye, Sparkles } from 'lucide-react';
import { generateDiffMap } from '../utils/imageProcessor';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalDataUrl: string;
  stegoDataUrl: string;
  width: number;
  height: number;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  originalDataUrl,
  stegoDataUrl,
  width,
  height,
}) => {
  const [activeTab, setActiveTab] = useState<'sideBySide' | 'diffMap'>('sideBySide');
  const [diffMapUrl, setDiffMapUrl] = useState<string>('');
  const [isGeneratingDiff, setIsGeneratingDiff] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'diffMap' && !diffMapUrl) {
      setIsGeneratingDiff(true);
      generateDiffMap(originalDataUrl, stegoDataUrl)
        .then((url) => {
          setDiffMapUrl(url);
          setIsGeneratingDiff(false);
        })
        .catch(() => {
          setIsGeneratingDiff(false);
        });
    }
  }, [isOpen, activeTab, originalDataUrl, stegoDataUrl, diffMapUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">
              So Sánh Ảnh Gốc &amp; Ảnh Đã Giấu Tin
            </h3>
            <span className="text-xs text-slate-400">
              ({width} &times; {height} px)
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ so sánh"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('sideBySide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'sideBySide'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> So sánh trực quan (Mắt thường)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diffMap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'diffMap'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Bản đồ khuếch đại bit ẩn (Diff Map x100)
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-auto">
          {activeTab === 'sideBySide' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                    <span>1. Ảnh Gốc (Original)</span>
                    <span className="text-slate-500">Chưa chèn mã</span>
                  </div>
                  <div className="relative aspect-4/3 bg-black/60 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={originalDataUrl}
                      alt="Ảnh gốc"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                  <div className="text-xs font-semibold text-indigo-300 mb-2 flex items-center justify-between">
                    <span>2. Ảnh Đã Giấu Tin (Stego Image)</span>
                    <span className="text-emerald-400 font-medium">LSB Encoded</span>
                  </div>
                  <div className="relative aspect-4/3 bg-black/60 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={stegoDataUrl}
                      alt="Ảnh đã giấu tin"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3 text-xs text-indigo-200">
                💡 <strong>Nhận xét:</strong> Hai bức ảnh trông hoàn toàn giống hệt nhau 100% dưới mắt nhìn con người. Kỹ thuật LSB chỉ thay đổi bit cuối cùng của kênh màu (tối đa 1 đơn vị trên thang 0-255), khiến mọi thuật toán nén thông thường hay người xem không thể phát hiện.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col items-center">
                {isGeneratingDiff ? (
                  <div className="py-20 text-center">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-slate-400">Đang phân tích và khuếch đại bit khác biệt...</p>
                  </div>
                ) : diffMapUrl ? (
                  <div className="relative max-h-[50vh] flex items-center justify-center">
                    <img
                      src={diffMapUrl}
                      alt="Bản đồ khuếch đại khác biệt"
                      className="max-h-[50vh] w-auto object-contain rounded-lg border border-slate-700"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-10">Không thể tạo bản đồ khác biệt.</p>
                )}
              </div>

              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white">Giải thích Bản Đồ Khuếch Đại (Diff Map):</p>
                <p>
                  Các điểm sáng màu <span className="text-cyan-400 font-bold">Xanh ngọc / Đỏ rực</span> là các điểm ảnh (pixels) mà bit dữ liệu của thông điệp được ghi vào. Phần nền tối đen là các pixel còn lại hoàn toàn không bị chạm tới.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
