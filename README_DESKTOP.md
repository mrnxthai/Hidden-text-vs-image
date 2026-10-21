# Hướng Dẫn Đóng Gói & Chạy Ứng Dụng StegoVault Trên Windows & macOS

Ứng dụng **StegoVault** được thiết kế chạy 100% độc lập tại máy khách (Client-side), không phụ thuộc vào bất kỳ máy chủ bên ngoài nào. Bạn có thể triển khai thành phần mềm máy tính độc lập (Desktop App) trên cả **Windows** và **macOS** theo các cách sau:

---

## ⚡ Cách 1: Cài đặt trực tiếp làm Desktop App độc lập qua PWA (Khuyên dùng - Nhanh nhất)

Ứng dụng đã được tích hợp chuẩn **Progressive Web App (PWA)** và **Service Worker Offline**. Bạn có thể cài đặt trực tiếp vào hệ điều hành chỉ trong 5 giây:

### Trên Windows (Google Chrome, Microsoft Edge, Brave):
1. Mở trang web ứng dụng trên trình duyệt Chrome hoặc Edge.
2. Nhìn lên góc phải thanh địa chỉ (URL bar), nhấn vào biểu tượng **"Cài đặt ứng dụng"** (Install App 💻 / ⊕).
3. Hoặc nhấn menu trình duyệt (dấu 3 chấm `...`) -> chọn **"Cài đặt StegoVault..."** (Install StegoVault).
4. **Kết quả:** Ứng dụng sẽ xuất hiện như một phần mềm máy tính độc lập, có icon riêng trên **Desktop** và trong **Menu Start**, chạy trong cửa sổ riêng không có thanh trình duyệt, hoạt động ngay cả khi **mất kết nối Internet**!

### Trên macOS (Google Chrome, Safari, Edge):
1. Mở ứng dụng trong **Chrome** hoặc **Safari** (macOS Sonoma trở lên).
2. **Trên Safari:** Nhấn menu `Tệp` (File) -> Chọn **"Thêm vào Dock"** (Add to Dock).
3. **Trên Chrome/Edge:** Nhấn biểu tượng Cài đặt trên thanh địa chỉ hoặc menu `...` -> Chọn **"Cài đặt StegoVault"**.
4. **Kết quả:** Biểu tượng StegoVault xuất hiện trong **Launchpad** và thanh **Dock** của Mac, mở ra như một ứng dụng Mac (`.app`) chuẩn.

---

## 📦 Cách 2: Đóng gói thành file cài đặt độc lập (.exe cho Windows và .dmg cho Mac) bằng Electron

Trong mã nguồn dự án đã được tích hợp sẵn file khởi chạy Electron tại thư mục `electron/main.cjs`.

### Các bước thực hiện:

#### Bước 1: Tải mã nguồn về máy tính
```bash
git clone <url-repo-cua-ban>
cd <thu-muc-du-an>
npm install
```

#### Bước 2: Cài đặt thêm electron và electron-builder
```bash
npm install -D electron electron-builder
```

#### Bước 3: Cấu hình `package.json`
Thêm mục `main` và cấu hình build vào `package.json`:
```json
{
  "main": "electron/main.cjs",
  "scripts": {
    "electron:dev": "electron .",
    "electron:build": "npm run build && electron-builder --win --mac"
  },
  "build": {
    "appId": "com.stegovault.app",
    "productName": "StegoVault",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "public/**/*"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/icon-512.png"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "public/icon-512.png",
      "category": "public.app-category.utilities"
    }
  }
}
```

#### Bước 4: Chạy lệnh đóng gói
- Để đóng gói file cài đặt cho **Windows** (`.exe`):
  ```bash
  npm run build
  npx electron-builder --win
  ```
  *(File cài đặt `.exe` sẽ được tạo trong thư mục `dist-electron/`)*

- Để đóng gói file cài đặt cho **macOS** (`.dmg`):
  ```bash
  npm run build
  npx electron-builder --mac
  ```
  *(File cài đặt `.dmg` sẽ được tạo trong thư mục `dist-electron/`)*

---

## 🦀 Cách 3: Đóng gói siêu nhẹ (<5 MB) bằng Tauri (Rust)

Nếu bạn muốn phần mềm chạy cực kỳ mượt mà, khởi động ngay lập tức và dung lượng file cài đặt chỉ khoảng 3-5 MB:

1. Cài đặt Tauri CLI:
   ```bash
   npm install -D @tauri-apps/cli
   ```
2. Khởi tạo Tauri cho dự án Vite:
   ```bash
   npx tauri init
   ```
   - *App name:* StegoVault
   - *Window title:* StegoVault - Ẩn & Trích Xuất Thông Điệp
   - *Web assets:* `../dist`
   - *Dev server URL:* `http://localhost:3000`
3. Đóng gói ra file cài đặt:
   ```bash
   npm run build
   npx tauri build
   ```
   Tauri sẽ tự động biên dịch file `.msi` / `.exe` trên Windows và `.dmg` / `.app` trên Mac.
