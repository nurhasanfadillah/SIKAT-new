import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';

// CRC32 lookup table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  crcTable[i] = c;
}
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function u32be(n) { const b = Buffer.alloc(4); b.writeUInt32BE(n, 0); return b; }
function pngChunk(type, data) {
  const t = Buffer.from(type);
  return Buffer.concat([u32be(data.length), t, data, u32be(crc32(Buffer.concat([t, data])))]);
}

function createSolidPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; ihdrData[9] = 2; // 8-bit RGB
  const ihdr = pngChunk('IHDR', ihdrData);
  const rowBytes = 1 + size * 3;
  const raw = Buffer.alloc(rowBytes * size);
  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      raw[y * rowBytes + 1 + x * 3] = r;
      raw[y * rowBytes + 1 + x * 3 + 1] = g;
      raw[y * rowBytes + 1 + x * 3 + 2] = b;
    }
  }
  const idat = pngChunk('IDAT', deflateSync(raw));
  const iend = pngChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

// SIKAT blue: #2563EB (Tailwind blue-600)
const [r, g, b] = [37, 99, 235];

mkdirSync('public', { recursive: true });
writeFileSync('public/pwa-192x192.png', createSolidPNG(192, r, g, b));
writeFileSync('public/pwa-512x512.png', createSolidPNG(512, r, g, b));
writeFileSync('public/pwa-maskable-512x512.png', createSolidPNG(512, r, g, b));

console.log('Icons generated: pwa-192x192.png, pwa-512x512.png, pwa-maskable-512x512.png');
