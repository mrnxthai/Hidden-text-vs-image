import React, { useState } from 'react';
import {
  Lock,
  Search,
  Columns,
  Layers,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Info,
} from 'lucide-react';
import { Header } from './components/Header';
import { EncodePanel } from './components/EncodePanel';
import { DecodePanel } from './components/DecodePanel';
import { HowItWorksModal } from './components/HowItWorksModal';
import { CompareModal } from './components/CompareModal';
import { DesktopDeployModal } from './components/DesktopDeployModal';

type ViewMode = 'tabs' | 'split';
type ActiveTab = 'encode' | 'decode';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [activeTab, setActiveTab] = useState<ActiveTab>('encode');

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleTriggerPwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const [compareData, setCompareData] = useState<{
    isOpen: boolean;
    orig: string;
    stego: string;
    w: number;
    h: number;
  }>({
    isOpen: false,
    orig: '',
    stego: '',
    w: 0,
    h: 0,
  });

  const [forwardedImage, setForwardedImage] = useState<{
    dataUrl: string;
    name: string;
  } | null>(null);

  // When user clicks "Chuyển sang Khung 2 để giải mã" in EncodePanel:
  const handleTransferToDecode = (dataUrl: string, name: string) => {
    setForwardedImage({ dataUrl, name });
    setActiveTab('decode');
    // Scroll smoothly to Decode panel if in split view
    const decodeEl = document.getElementById('decode-panel-anchor');
    if (decodeEl) {
      decodeEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenCompare = (orig: string, stego: string, w: number, h: number) => {
    setCompareData({
      isOpen: true,
      orig,
      stego,
      w,
      h,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenDesktop={() => setIsDesktopModalOpen(true)}
        canInstallPwa={Boolean(deferredPrompt)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Intro banner with view toggle */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Ẩn &amp; Trích Xuất Dữ Liệu Trong Ảnh</span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/70">
                Steganography LSB
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Giấu thông điệp văn bản bí mật vào từng điểm ảnh của hình ảnh mà mắt thường không thể phân biệt được. 
              Sau đó tải ảnh về máy và giải mã thông điệp bất kỳ lúc nào với độ chính xác 100%.
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Hiển thị song song cả 2 khung"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Song song (2 khung)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('tabs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'tabs'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Chuyển đổi theo thẻ (Từng khung một)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dạng Thẻ (Tabs)</span>
            </button>
          </div>
        </div>

        {/* Tab navigation if viewMode === 'tabs' */}
        {viewMode === 'tabs' && (
          <div className="flex border-b border-slate-200 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('encode')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'encode'
                  ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
                1
              </div>
              <Lock className="w-4 h-4" />
              <span>Khung 1: Chèn Thông Điệp &amp; Tải Ảnh Về</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('decode')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'decode'
                  ? 'border-violet-600 text-violet-600 bg-white rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs">
                2
              </div>
              <Search className="w-4 h-4" />
              <span>Khung 2: Kiểm Tra &amp; Trích Xuất Thông Điệp</span>
            </button>
          </div>
        )}

        {/* PANELS CONTAINER */}
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div id="encode-panel-anchor">
              <EncodePanel
                onTransferToDecode={handleTransferToDecode}
                onOpenCompare={handleOpenCompare}
              />
            </div>
            <div id="decode-panel-anchor">
              <DecodePanel
                incomingImage={forwardedImage}
                onClearIncomingImage={() => setForwardedImage(null)}
              />
            </div>
          </div>
        ) : (
          <div>
            {activeTab === 'encode' ? (
              <EncodePanel
                onTransferToDecode={handleTransferToDecode}
                onOpenCompare={handleOpenCompare}
              />
            ) : (
              <DecodePanel
                incomingImage={forwardedImage}
                onClearIncomingImage={() => setForwardedImage(null)}
              />
            )}
          </div>
        )}

        {/* Feature Highlights Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Vô hình trước mắt người</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Thuật toán LSB chỉ đổi 1 bit thấp nhất của điểm ảnh, giữ nguyên 100% màu sắc và chất lượng mắt nhìn.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Mã hóa AES-256 tùy chọn</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Bảo vệ thêm một lớp mật khẩu để dù người khác phát hiện bit ẩn cũng không thể đọc được nội dung.
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Hỗ trợ đầy đủ tiếng Việt &amp; Emoji</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã hóa chuẩn UTF-8 đa byte bảo toàn hoàn hảo các ký tự có dấu, ký tự đặc biệt và biểu tượng cảm xúc.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2026 <strong>StegoVault</strong> • Hệ thống Giấu tin &amp; Trích xuất thông điệp trong ảnh
          </p>
          <div className="flex items-center gap-4 text-slate-600">
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-indigo-600 underline cursor-pointer"
            >
              Nguyên lý hoạt động
            </button>
            <span>•</span>
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Xử lý hoàn toàn Offline trong trình duyệt
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DesktopDeployModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
        onTriggerPwaInstall={handleTriggerPwaInstall}
        canInstallPwa={Boolean(deferredPrompt)}
      />

      <HowItWorksModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <CompareModal
        isOpen={compareData.isOpen}
        onClose={() => setCompareData((prev) => ({ ...prev, isOpen: false }))}
        originalDataUrl={compareData.orig}
        stegoDataUrl={compareData.stego}
        width={compareData.w}
        height={compareData.h}
      />
    </div>
  );
}
