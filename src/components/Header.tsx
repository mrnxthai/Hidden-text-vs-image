import React from 'react';
import { ShieldCheck, HelpCircle, Lock, EyeOff } from 'lucide-react';

interface HeaderProps {
  onOpenHelp: () => void;
  onOpenDesktop: () => void;
  canInstallPwa?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  onOpenDesktop,
  canInstallPwa,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">StegoVault</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Lock className="w-3 h-3" /> LSB Stego
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Giấu &amp; Trích xuất thông điệp bí mật trong hình ảnh không suy hao
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop App Button */}
          <button
            type="button"
            onClick={onOpenDesktop}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            title="Hướng dẫn cài đặt ứng dụng độc lập trên Mac & Windows"
          >
            <span className="text-sm">💻</span>
            <span className="hidden sm:inline">Chạy trên Mac &amp; Windows</span>
            <span className="sm:hidden">App Desktop</span>
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer"
            aria-label="Xem hướng dẫn sử dụng và nguyên lý"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden md:inline">Nguyên lý</span>
          </button>
        </div>
      </div>
    </header>
  );
};
