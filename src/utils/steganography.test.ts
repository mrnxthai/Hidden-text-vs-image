import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCapacity,
  buildStegoPackage,
  embedBytesInPixels,
  probeStegoHeader,
  extractMessageFromPixels,
} from './steganography.ts';

test('calculateCapacity calculates expected bit and byte capacity', () => {
  const cap = calculateCapacity(100, 100); // 10,000 pixels = 30,000 bits = 3,750 bytes
  assert.equal(cap.totalBits, 30000);
  assert.ok(cap.maxPayloadBytes > 3600);
  assert.ok(cap.maxCharactersEst > 2000);
});

test('embeds and decodes unencrypted UTF-8 Vietnamese message correctly', async () => {
  const testMessage = 'Xin chào Việt Nam! Đây là thông điệp bí mật tiếng Việt có dấu: Ắ, Ằ, Ồ, Ệ, Ỹ... 🚀';
  
  // Create dummy image pixels: 100x100 = 10000 pixels * 4 = 40000 bytes
  const pixels = new Uint8ClampedArray(100 * 100 * 4);
  // Fill with dummy color values
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 120;     // R
    pixels[i + 1] = 180; // G
    pixels[i + 2] = 220; // B
    pixels[i + 3] = 255; // A (should remain 255)
  }

  const pkg = await buildStegoPackage(testMessage);
  embedBytesInPixels(pixels, pkg);

  // Probe
  const probe = probeStegoHeader(pixels);
  assert.equal(probe.isValid, true);
  assert.equal(probe.isEncrypted, false);

  // Extract
  const result = await extractMessageFromPixels(pixels);
  assert.equal(result.success, true);
  assert.equal(result.text, testMessage);
  assert.equal(result.isEncrypted, false);

  // Ensure Alpha channels were not mutated
  for (let i = 0; i < pixels.length; i += 4) {
    assert.equal(pixels[i + 3], 255);
  }
});

test('embeds and decodes encrypted message with correct password', async () => {
  const secretMessage = 'Tài khoản ngân hàng: 987654321, Mã PIN: 8888';
  const password = 'MatKhauSieuCap123@#';

  const pixels = new Uint8ClampedArray(120 * 120 * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 200;
    pixels[i + 1] = 150;
    pixels[i + 2] = 100;
    pixels[i + 3] = 255;
  }

  const pkg = await buildStegoPackage(secretMessage, password);
  embedBytesInPixels(pixels, pkg);

  const probe = probeStegoHeader(pixels);
  assert.equal(probe.isValid, true);
  assert.equal(probe.isEncrypted, true);

  // Trying to extract without password should indicate password is required
  const noPassResult = await extractMessageFromPixels(pixels);
  assert.equal(noPassResult.success, false);
  assert.equal(noPassResult.requiresPassword, true);

  // Trying with wrong password should fail
  const wrongPassResult = await extractMessageFromPixels(pixels, 'sai_mat_khau');
  assert.equal(wrongPassResult.success, false);
  assert.ok(wrongPassResult.error?.includes('Mật khẩu') || wrongPassResult.error?.includes('không chính xác'));

  // Trying with right password should succeed
  const successResult = await extractMessageFromPixels(pixels, password);
  assert.equal(successResult.success, true);
  assert.equal(successResult.text, secretMessage);
  assert.equal(successResult.isEncrypted, true);
});

test('returns invalid for blank / unencoded pixels', async () => {
  const pixels = new Uint8ClampedArray(50 * 50 * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 255;
    pixels[i + 1] = 255;
    pixels[i + 2] = 255;
    pixels[i + 3] = 255;
  }

  const probe = probeStegoHeader(pixels);
  assert.equal(probe.isValid, false);

  const result = await extractMessageFromPixels(pixels);
  assert.equal(result.success, false);
  assert.ok(result.error?.includes('Không tìm thấy thông điệp'));
});

test('throws error if payload exceeds pixel capacity', async () => {
  const hugeText = 'A'.repeat(50000);
  // Small 10x10 image = only 100 pixels = 300 bits = ~37 bytes capacity
  const smallPixels = new Uint8ClampedArray(10 * 10 * 4);

  const pkg = await buildStegoPackage(hugeText);
  assert.throws(() => {
    embedBytesInPixels(smallPixels, pkg);
  }, /Dung lượng ảnh không đủ/);
});
