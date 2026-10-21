import React from 'react';
import { X, ShieldAlert, Cpu, FileCheck, ArrowRight, Lightbulb } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Nguyên Lý Hoạt Động &amp; Hướng Dẫn Sử Dụng
              </h3>
              <p className="text-xs text-slate-500">Kỹ thuật Giấu tin Steganography LSB (Least Significant Bit)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Đóng hướng dẫn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Step flow */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              1. LSB Steganography là gì?
            </h4>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-600 leading-relaxed space-y-2 text-xs sm:text-sm">
              <p>
                Mỗi điểm ảnh (pixel) trên máy tính được tạo bởi 3 kênh màu <strong>Đỏ (Red), Xanh lá (Green), Xanh dương (Blue)</strong>. Mỗi kênh màu có giá trị từ 0 đến 255 (8 bits).
              </p>
              <div className="font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 flex items-center justify-between flex-wrap gap-2">
                <span>Ví dụ màu gốc: <code className="text-indigo-600">1100101<strong>0</strong></code> (202)</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span>Chèn bit 1 vào: <code className="text-emerald-600">1100101<strong>1</strong></code> (203)</span>
              </div>
              <p>
                Sự thay đổi 1 đơn vị này <strong>hoàn toàn vô hình</strong> trước mắt người xem và không làm thay đổi cảm quan của bức ảnh.
              </p>
            </div>
          </div>

          {/* Golden Rule: PNG format */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              2. Vì sao bắt buộc phải dùng định dạng PNG?
            </h4>
            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-emerald-950 text-xs sm:text-sm space-y-2">
              <p>
                <strong>PNG là định dạng nén bảo toàn (Lossless)</strong>: Mọi pixel được giữ nguyên giá trị chính xác tuyệt đối từng bit.
              </p>
              <p>
                Ngược lại, <strong>JPEG/JPG là nén mất dữ liệu (Lossy)</strong>: Thuật toán nén JPEG sẽ làm mờ và tính xấp xỉ các bit màu, dẫn đến thông điệp ẩn bị xóa sạch.
              </p>
            </div>
          </div>

          {/* Social sending warning */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              3. Lưu ý khi gửi ảnh qua Zalo, Messenger, Facebook, Telegram
            </h4>
            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-amber-950 text-xs sm:text-sm space-y-2">
              <p>
                Hầu hết ứng dụng nhắn tin (Facebook Messenger, Zalo) tự động nén ảnh lại thành JPG để tiết kiệm băng thông mạng. Quá trình này sẽ phá hủy thông điệp bí mật.
              </p>
              <p className="font-semibold text-indigo-900">
                👉 Cách gửi an toàn: Luôn gửi ảnh dưới dạng <span className="underline font-bold">"File / Tài liệu" (Document/File)</span> hoặc nén vào file ZIP trước khi gửi.
              </p>
            </div>
          </div>

          {/* Encryption */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">4</span>
              Mã hóa bổ sung AES-256
            </h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Nếu bạn bật tùy chọn <strong>"Bảo vệ bằng mật khẩu"</strong>, thông điệp sẽ được mã hóa bằng thuật toán tiêu chuẩn quân sự <strong>AES-GCM 256-bit</strong> trước khi chèn vào ảnh. Ngay cả khi ai đó phát hiện bức ảnh có chứa bit ẩn, họ cũng không thể giải mã được nếu không có mật khẩu.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Đã hiểu, tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};
