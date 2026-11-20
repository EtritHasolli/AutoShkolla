// Renders the AutoShkolla logo into every icon the web app and the Android app
// need. Run: node scripts/make-icons.mjs  (then `npx capacitor-assets generate --android`)
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const BLUE_A = '#2f63f5', BLUE_B = '#1c47c7', AMBER = '#f59e0b';

// The steering-wheel glyph (24×24 path set from the in-app Icon component).
const glyph = (x, y, size, stroke) => `
  <g fill="none" stroke="#fff" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${x} ${y}) scale(${size / 24})">
    <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.6"/>
    <path d="M12 14.6V21"/><path d="M9.6 11.1L3.4 9.6"/><path d="M14.4 11.1l6.2-1.5"/>
  </g>`;
const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BLUE_A}"/><stop offset="1" stop-color="${BLUE_B}"/></linearGradient></defs>`;

// Full icon: gradient tile + glyph + amber dot. `round` = corner radius ratio.
function fullIcon(S, round = 0.3) {
  const g = S * 0.6;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${grad}
    <rect width="${S}" height="${S}" rx="${S * round}" fill="url(#g)"/>
    ${glyph((S - g) / 2, (S - g) / 2, g, 2.2)}
    <circle cx="${S * 0.77}" cy="${S * 0.23}" r="${S * 0.09}" fill="${AMBER}" stroke="${BLUE_A}" stroke-width="${S * 0.035}"/>
  </svg>`;
}
// Adaptive-icon foreground: glyph inside the 66% safe zone, transparent.
function foreground(S) {
  const g = S * 0.42;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
    ${glyph((S - g) / 2, (S - g) / 2, g, 2.2)}
    <circle cx="${S * 0.66}" cy="${S * 0.34}" r="${S * 0.06}" fill="${AMBER}" stroke="${BLUE_A}" stroke-width="${S * 0.022}"/>
  </svg>`;
}
const background = (S) => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">${grad}<rect width="${S}" height="${S}" fill="url(#g)"/></svg>`;
function splash(S, dark) {
  const L = S * 0.2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
    <rect width="${S}" height="${S}" fill="${dark ? '#0d1b3e' : '#ffffff'}"/>
    <g transform="translate(${(S - L) / 2} ${(S - L) / 2})">${fullIcon(L).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
  </svg>`;
}

const png = (svg, out) => sharp(Buffer.from(svg)).png().toFile(out);

mkdirSync('assets', { recursive: true });
await png(fullIcon(1024, 0), 'assets/icon-only.png');
await png(foreground(1024), 'assets/icon-foreground.png');
await png(background(1024), 'assets/icon-background.png');
await png(splash(2732, false), 'assets/splash.png');
await png(splash(2732, true), 'assets/splash-dark.png');
await png(fullIcon(192), 'public/icon-192.png');
await png(fullIcon(512), 'public/icon-512.png');
await png(fullIcon(512, 0), 'public/icon-maskable-512.png');
writeFileSync('public/manifest.webmanifest', JSON.stringify({
  name: 'AutoShkolla', short_name: 'AutoShkolla', start_url: '/', display: 'standalone',
  background_color: '#ffffff', theme_color: '#2456e6', lang: 'sq',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2) + '\n');
console.log('icons written');
