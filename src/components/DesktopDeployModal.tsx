import React, { useState } from 'react';
import {
  X,
  Monitor,
  Download,
  Terminal,
  Zap,
  Check,
  Copy,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Box,
} from 'lucide-react';

interface DesktopDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerPwaInstall?: () => void;
  canInstallPwa?: boolean;
}

export const DesktopDeployModal: React.FC<DesktopDeployModalProps> = ({
  isOpen,
  onClose,
  onTriggerPwaInstall,
  canInstallPwa,
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'electron' | 'tauri'>('pwa');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-linear-to-r from-indigo-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                Triển Khai Chạy Độc Lập Trên Mac &amp; Windows
              </h3>
              <p className="text-xs text-slate-500">
                Chạy như phần mềm máy tính độc lập, có icon riêng, hoạt động offline 100%
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pwa')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'pwa'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Cách 1: Cài đặt ngay (PWA - Nhanh nhất)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('electron')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'electron'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Box className="w-4 h-4 text-indigo-600" />
            <span>Cách 2: Đóng gói .exe &amp; .dmg (Electron)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tauri')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'tauri'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4 text-emerald-600" />
            <span>Cách 3: Siêu nhẹ 3MB (Tauri)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-900">
                    Ứng dụng đã sẵn sàng để cài đặt trực tiếp vào Mac và Windows!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    Bạn không cần cài đặt thêm phần mềm lập trình nào. Trình duyệt Chrome, Edge hoặc Safari sẽ tự động cài đặt StegoVault thành phần mềm độc lập vào máy tính.
                  </p>
                </div>
              </div>

              {/* Install action if browser supports prompt */}
              {canInstallPwa && onTriggerPwaInstall && (
                <div className="text-center py-2">
                  <button
                    type="button"
                    onClick={onTriggerPwaInstall}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Cài đặt StegoVault vào máy tính của bạn ngay</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Windows Guide */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                    <span>🪟 Trên máy tính Windows</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-600 leading-relaxed">
                    <li>Mở web này bằng <strong>Google Chrome</strong> hoặc <strong>Microsoft Edge</strong>.</li>
                    <li>
                      Nhìn lên phía bên phải của <strong>thanh địa chỉ URL</strong>, nhấn vào biểu tượng <strong>Cài đặt</strong> (Install App ⊕).
                    </li>
                    <li>Hoặc nhấn menu 3 chấm <code>⋮</code> &rarr; Chọn <strong>"Cài đặt StegoVault..."</strong>.</li>
                    <li>
                      App sẽ có icon riêng ngoài <strong>Desktop</strong> và trong <strong>Start Menu</strong>, mở trong cửa sổ riêng biệt không có thanh trình duyệt.
                    </li>
                  </ol>
                </div>

                {/* Mac Guide */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                    <span>🍎 Trên máy tính Mac (macOS)</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-600 leading-relaxed">
                    <li>
                      <strong>Cách 1 (Chrome/Edge trên Mac):</strong> Nhấn biểu tượng cài đặt trên thanh URL &rarr; Chọn <em>Cài đặt StegoVault</em>.
                    </li>
                    <li>
                      <strong>Cách 2 (Safari trên macOS Sonoma+):</strong> Nhấn vào thanh menu <strong>Tệp (File)</strong> &rarr; Chọn <strong>"Thêm vào Dock" (Add to Dock)</strong>.
                    </li>
                    <li>
                      App sẽ xuất hiện trong <strong>Launchpad</strong> và <strong>thanh Dock</strong> của Mac, khởi chạy độc lập như file <code>.app</code> bản địa.
                    </li>
                  </ol>
                </div>
              </div>

              <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  💡 <strong>Ưu điểm:</strong> Tự động cập nhật tính năng mới, dung lượng 0 MB, chạy offline không cần mạng, dữ liệu ảnh hoàn toàn xử lý an toàn tại máy của bạn.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'electron' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Dự án đã được tích hợp sẵn file khởi chạy <code>electron/main.cjs</code>. Bạn có thể đóng gói ra file cài đặt <strong>.exe (Windows)</strong> và <strong>.dmg (macOS)</strong> để phân phối cho người dùng cài đặt độc lập:
              </p>

              <div className="space-y-3">
                <div className="bg-slate-900 rounded-xl p-3.5 text-slate-100 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Bước 1: Cài đặt công cụ đóng gói
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode('npm install -D electron electron-builder', 1)}
                      className="text-xs hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === 1 ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <code>npm install -D electron electron-builder</code>
                </div>

                <div className="bg-slate-900 rounded-xl p-3.5 text-slate-100 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Bước 2: Tạo file .exe cho Windows
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode('npm run build && npx electron-builder --win', 2)}
                      className="text-xs hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === 2 ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <code>npm run build &amp;&amp; npx electron-builder --win</code>
                </div>

                <div className="bg-slate-900 rounded-xl p-3.5 text-slate-100 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Bước 3: Tạo file .dmg cho macOS
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCode('npm run build && npx electron-builder --mac', 3)}
                      className="text-xs hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === 3 ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <code>npm run build &amp;&amp; npx electron-builder --mac</code>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                📁 File cài đặt sau khi tạo sẽ nằm trong thư mục <strong>dist-electron/</strong> của dự án, người dùng chỉ cần click đúp vào để cài đặt bình thường như mọi phần mềm khác.
              </div>
            </div>
          )}

          {activeTab === 'tauri' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Tauri</strong> là công nghệ mới nhất hiện nay thay thế Electron, sử dụng Rust để tạo file cài đặt siêu nhẹ (chỉ khoảng <strong>3 - 5 MB</strong>, nhẹ hơn 20 lần so với Electron) và tiêu tốn cực kỳ ít RAM:
              </p>

              <div className="bg-slate-900 rounded-xl p-3.5 text-slate-100 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Lệnh tạo app Tauri siêu nhẹ
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCode('npx @tauri-apps/cli init && npm run build && npx tauri build', 4)}
                    className="text-xs hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedIndex === 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 4 ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
                <code>npx @tauri-apps/cli init &amp;&amp; npm run build &amp;&amp; npx tauri build</code>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800">✅ Ưu điểm:</span>
                  <ul className="list-disc pl-4 mt-1 text-slate-600 space-y-0.5">
                    <li>Dung lượng file tải chỉ 3-5 MB</li>
                    <li>Khởi động tức thì (dưới 0.2 giây)</li>
                    <li>Tốn dưới 30MB RAM</li>
                  </ul>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-800">📦 Kết quả:</span>
                  <ul className="list-disc pl-4 mt-1 text-slate-600 space-y-0.5">
                    <li>Windows: file <code>.msi</code> và <code>.exe</code></li>
                    <li>macOS: file <code>.dmg</code> và <code>.app</code></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 hidden sm:block">
            Xem thêm chi tiết tại file <code>README_DESKTOP.md</code> trong mã nguồn
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ml-auto"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
