// Regenerates sitemap.xml: node build-sitemap.js
// Lists the main pages plus every chapter that has a content/<class>/<chapter>.md file, using the same /m5/ai-development/mlp routes as the site.
const fs = require('fs');
const ORIGIN = 'https://learnc0de.vercel.app';
const src = fs.readFileSync(__dirname + '/shell.js', 'utf8');
const notes = eval(src.slice(src.indexOf('const notes = ') + 'const notes = '.length, src.indexOf('];', src.indexOf('const notes = ')) + 1));
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const day = new Date().toISOString().slice(0, 10);
const urls = ['/', '/roadmap', '/notes', '/work', '/tools', '/about'];
for (const [g, , , ns, yr] of notes) {
  const y = yr.split(' ')[0].toLowerCase().replace('.', '');
  for (const n of ns) if (!n.startsWith('# ') && n !== 'Coming soon' && fs.existsSync(`${__dirname}/content/${slug(g)}/${slug(n)}.md`)) urls.push(`/${y}/${slug(g)}/${slug(n)}`);
}
fs.writeFileSync(__dirname + '/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${ORIGIN}${u}</loc><lastmod>${day}</lastmod></url>`).join('\n')}\n</urlset>\n`);
console.log(urls.length + ' urls written to sitemap.xml');
