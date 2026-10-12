const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const asset = (file, mime) => `data:${mime};base64,${fs.readFileSync(path.join(root, 'dist/assets', file)).toString('base64')}`;
const values = {
  STORE: 'https://www.teacherspayteachers.com/store/telespeech-space',
  LOGO: asset('telespeech-space-logo.svg', 'image/svg+xml'),
  FONT_REGULAR: asset('nunito-regular.ttf', 'font/ttf'),
  FONT_BOLD: asset('nunito-extrabold.ttf', 'font/ttf'),
  POTION: asset('potion-lab.avif', 'image/avif'),
  EMOJI: asset('emoji-emotions.avif', 'image/avif'),
  MICROWAVE: asset('microwave.avif', 'image/avif'),
};
let html = fs.readFileSync(path.join(root, 'page.html'), 'utf8');
html = html.replace(/\{\{(\w+)\}\}/g, (_, key) => {
  if (!values[key]) throw new Error(`Unknown asset: ${key}`);
  return values[key];
});
const fontLicense = fs.readFileSync(path.join(root, 'FONT-LICENSE.txt'), 'utf8');
html = html.replace('</head>', `<!-- Embedded Nunito font license:\n${fontLicense.replace(/--/g, '—')}\n-->\n</head>`);
fs.writeFileSync(path.join(root, 'dist/index.html'), html);
console.log(`Built one self-contained HTML file (${Math.round(Buffer.byteLength(html) / 1024)} KB).`);
