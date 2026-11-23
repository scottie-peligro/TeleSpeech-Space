const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const assets = path.join(root, 'dist/assets');
const store = 'https://www.teacherspayteachers.com/store/telespeech-space';
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const asset = (file, mime) => `data:${mime};base64,${fs.readFileSync(path.join(assets, file)).toString('base64')}`;
const arrow = '<svg class="arrow" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const products = JSON.parse(fs.readFileSync(path.join(root, 'products.json'), 'utf8'));
if (!Array.isArray(products) || !products.length) throw new Error('products.json must contain at least one product.');
const productHTML = products.map((product, index) => {
  for (const key of ['name', 'category', 'image', 'imageAlt', 'skills', 'includes', 'requirements']) {
    if (typeof product[key] !== 'string' || !product[key].trim()) throw new Error(`Product ${index + 1}: ${key} is required.`);
  }
  if (!Array.isArray(product.description) || !product.description.length || product.description.some(p => typeof p !== 'string' || !p.trim())) throw new Error(`Product ${index + 1}: description must be an array of paragraphs.`);
  if (path.basename(product.image) !== product.image) throw new Error(`Product ${index + 1}: image must be a filename in dist/assets.`);
  const mime = {'.avif':'image/avif','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'}[path.extname(product.image).toLowerCase()];
  if (!mime) throw new Error(`Product ${index + 1}: unsupported image format.`);
  return `<article class="product" aria-labelledby="product-${index + 1}">
    <div class="product-art reveal"><div class="image-frame"><img src="${asset(product.image, mime)}" alt="${escapeHTML(product.imageAlt)}" width="500" height="500" loading="lazy" decoding="async"></div><span class="product-number" aria-hidden="true">0${index + 1}</span></div>
    <div class="product-copy reveal"><p class="eyebrow">${escapeHTML(product.category)}</p><h3 id="product-${index + 1}">${escapeHTML(product.name)}</h3>
      ${product.description.map(p => `<p>${escapeHTML(p)}</p>`).join('\n')}
      <dl class="product-details"><div><dt>Skills</dt><dd>${escapeHTML(product.skills)}</dd></div><div><dt>Included</dt><dd>${escapeHTML(product.includes)}</dd></div></dl>
      <a class="text-link" href="${store}" aria-label="Shop ${escapeHTML(product.name)} in the Telespeech Space TPT store">Shop on TPT ${arrow}</a>
      <p class="requirements">${escapeHTML(product.requirements)}</p>
    </div>
  </article>`;
}).join('\n');
const stars = Array.from({ length: 210 }, (_, i) => {
  const x = (i * 347 + 67) % 1440;
  const y = (i * 571 + 31) % 1400;
  const r = i % 17 === 0 ? 1.7 : i % 5 === 0 ? 1 : .6;
  return `<circle cx="${x}" cy="${y}" r="${r}" opacity="${.18 + (i % 5) * .1}"/>`;
}).join('');
const values = {
  STORE: store,
  LOGO: asset('telespeech-space-logo.svg', 'image/svg+xml'),
  FONT_REGULAR: asset('nunito-regular.ttf', 'font/ttf'),
  FONT_BOLD: asset('nunito-extrabold.ttf', 'font/ttf'),
  PRODUCTS: productHTML,
  STARS: stars,
  ARROW: arrow,
};
let html = fs.readFileSync(path.join(root, 'page.html'), 'utf8').replace(/\{\{(\w+)\}\}/g, (_, key) => {
  if (!(key in values)) throw new Error(`Unknown placeholder: ${key}`);
  return values[key];
});
const fontLicense = fs.readFileSync(path.join(root, 'FONT-LICENSE.txt'), 'utf8');
html = html.replace('</head>', `<!-- Embedded Nunito font license:\n${fontLicense.replace(/--/g, '—')}\n-->\n</head>`);
fs.writeFileSync(path.join(root, 'dist/index.html'), html);
console.log(`Built ${products.length} products into one self-contained HTML file (${Math.round(Buffer.byteLength(html) / 1024)} KB).`);
