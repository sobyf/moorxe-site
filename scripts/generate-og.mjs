// Generates public/og.png (1200x630): a monochrome strand field with a
// central ring mark. Pure Node.js, no dependencies.
// Run: node scripts/generate-og.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const W = 1200;
const H = 630;
const here = dirname(fileURLToPath(import.meta.url));

// Seeded PRNG for a stable image.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const px = new Float32Array(W * H); // brightness 0..1
function dot(x, y, v) {
  const xi = Math.round(x);
  const yi = Math.round(y);
  if (xi < 0 || yi < 0 || xi >= W || yi >= H) return;
  const i = yi * W + xi;
  px[i] = Math.min(1, px[i] + v);
}

const rand = mulberry32(20261017);
// Flowing strands.
for (let s = 0; s < 34; s++) {
  const amp = 30 + rand() * 110;
  const freq = 1 + rand() * 2.2;
  const phase = rand() * Math.PI * 2;
  const yBase = H * 0.15 + rand() * H * 0.7;
  const drift = (rand() - 0.5) * 60;
  const bright = 0.25 + rand() * 0.55;
  for (let x = 0; x < W; x += 1) {
    const t = x / W;
    const y =
      yBase +
      Math.sin(t * Math.PI * 2 * freq + phase) * amp +
      drift * t;
    dot(x, y, bright * 0.5);
    dot(x, y + 1, bright * 0.25);
  }
}
// Real Moorxe logo mark at center: ring plus the block glyph from
// public/moorxe-logo-white.svg (same 0.85 inner spacing), scanline-filled.
const LOGO_VERTICES = [
  [14.05, 8.45], [17.95, 8.45], [17.95, 9.85], [21.4, 9.85], [21.4, 12],
  [25, 12], [25, 14.95], [26, 14.95], [26, 22.5], [24.55, 22.5],
  [24.55, 20.9], [23.1, 20.9], [23.1, 22.5], [21.65, 22.5], [21.65, 16.9],
  [17.95, 16.9], [17.95, 22.5], [14.05, 22.5], [14.05, 16.9], [10.35, 16.9],
  [10.35, 22.5], [8.9, 22.5], [8.9, 20.9], [7.45, 20.9], [7.45, 22.5],
  [6, 22.5], [6, 14.95], [7, 14.95], [7, 12], [10.6, 12], [10.6, 9.85],
  [14.05, 9.85],
];
const LOGO_SCALE = 11; // svg units -> px (352px mark)
const LOGO_GAP = 0.85; // matches the svg inner spacing
const logoPt = ([x, y]) => [
  W / 2 + (x - 16) * LOGO_GAP * LOGO_SCALE,
  H / 2 + (y - 16) * LOGO_GAP * LOGO_SCALE,
];
const logoPoly = LOGO_VERTICES.map(logoPt);
const logoXs = logoPoly.map(([x]) => x);
const logoYs = logoPoly.map(([, y]) => y);
const lx0 = Math.floor(Math.min(...logoXs));
const lx1 = Math.ceil(Math.max(...logoXs));
const ly0 = Math.floor(Math.min(...logoYs));
const ly1 = Math.ceil(Math.max(...logoYs));
// 2x2 supersampled even-odd scanline fill.
for (let y = ly0; y < ly1; y++) {
  for (let x = lx0; x < lx1; x++) {
    let inside = 0;
    for (let s = 0; s < 4; s++) {
      const sx = x + (s % 2 ? 0.75 : 0.25);
      const sy = y + (s < 2 ? 0.25 : 0.75);
      let crossings = 0;
      for (let i = 0; i < logoPoly.length; i++) {
        const [ax, ay] = logoPoly[i];
        const [bx, by] = logoPoly[(i + 1) % logoPoly.length];
        if ((ay > sy) !== (by > sy)) {
          const ix = ax + ((sy - ay) / (by - ay)) * (bx - ax);
          if (ix > sx) crossings++;
        }
      }
      if (crossings % 2 === 1) inside++;
    }
    if (inside > 0) dot(x, y, (inside / 4) * 0.95);
  }
}
// Ring outline around the glyph: a crisp narrow stroke, not a soft band.
{
  const r = 13 * LOGO_SCALE;
  for (let a = 0; a < Math.PI * 2; a += 0.0008) {
    for (const o of [-2, 0, 2]) {
      dot(W / 2 + Math.cos(a) * (r + o), H / 2 + Math.sin(a) * (r + o), 0.9);
    }
  }
}

// Encode truecolor PNG.
const stride = W * 3 + 1;
const raw = Buffer.alloc(stride * H);
for (let y = 0; y < H; y++) {
  raw[y * stride] = 0; // filter: none
  for (let x = 0; x < W; x++) {
    // #050505 base with soft-white strands.
    const b = Math.min(1, px[y * W + x]);
    const v = Math.round(5 + (241 - 5) * b);
    const o = y * stride + 1 + x * 3;
    raw[o] = v;
    raw[o + 1] = v;
    raw[o + 2] = v - 2 < 5 ? 5 : v - 2;
  }
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crcTable = chunk.table ?? (chunk.table = makeCrcTable());
  let crc = 0xffffffff;
  for (const byte of body) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([len, body, crcBuf]);
}
function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // truecolor
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = join(here, "..", "public", "og.png");
writeFileSync(out, png);
console.log(`Wrote ${out} (${png.length} bytes)`);
