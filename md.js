// Shared Markdown reader: used by chapter.js (lessons and the note preview).
// Needs shell.js first, for icon().

// ---- tiny Markdown: headings, paragraphs, lists, tables, code blocks, note boxes, images, links, bold, italic, inline code
const mdEsc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mdInline = s => mdEsc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>')
  .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2">')
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

// python colours: comments, strings (with f/r prefixes), numbers, keywords, common built-ins
const PY = /(#.*)|([fFrRbB]{0,2}(?:"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|\b(\d+(?:\.\d+)?)\b|\b(True|False|None)\b|\b(def|class|if|elif|else|for|while|in|not|and|or|return|import|from|as|pass|break|continue|try|except|finally|with|lambda|is|raise|global|yield)\b|\b([A-Za-z_]\w*)(?=\()/g;
function mdCode(code, lang) {
  if (lang !== 'python') return mdEsc(code);
  let out = '', last = 0, m;
  PY.lastIndex = 0;
  while ((m = PY.exec(code))) {
    out += mdEsc(code.slice(last, m.index));
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] || m[4] ? 'n' : m[5] ? 'k' : /^[A-Z]/.test(m[6]) ? 'y' : 'b';
    out += `<span class="${cls}">${mdEsc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + mdEsc(code.slice(last));
}

// note boxes: "> text" is a plain note; "> [!aha] text" is a coloured one (aha, compare, tip, warn)
const CALLOUTS = { aha: ['lightbulb', 'Aha!'], compare: ['puzzle-piece', 'Think of it like'], tip: ['sparkle', 'Tip'], warn: ['warning', 'Careful'] };

const tableCells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

// '@compare#MLP,CNN' means the site page compare (with a hash): /compare on the live site, compare.html when opened locally
const pg = u => { if (u[0] !== '@') return u; const [p, h] = u.slice(1).split('#'); return (typeof pretty !== 'undefined' && pretty ? '/' + p : p + '.html') + (h ? '#' + h : ''); };
function mdParse(src) {
  const meta = {};
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fm) {
    fm[1].split(/\r?\n/).forEach(l => { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
    src = src.slice(fm[0].length);
  }
  const lines = src.split(/\r?\n/), out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    let m;
    if (!l.trim()) { i++; continue; }
    if ((m = l.match(/^(```|~~~)\s*(\w*)/))) {
      const buf = [];
      for (i++; i < lines.length && !lines[i].startsWith(m[1]); i++) buf.push(lines[i]);
      i++;
      const lang = m[2].toLowerCase();
      if (lang === 'cta') { const rows = buf.filter(x => x.trim()).map(x => x.split('|').map(v => v.trim())), [ic, t, d] = rows[0];
        out.push(`<div class="ctac"><span class="tmi">${icon(ic)}</span><div><b>${mdInline(t)}</b><p>${mdInline(d)}</p><div class="ctal">${rows.slice(1).map(([l, u, sub]) => `<a href="${mdEsc(pg(u))}"${u[0] === '@' ? '' : ' target="_blank" rel="noopener"'}><span><b>${mdInline(l)}</b>${sub ? `<small>${mdInline(sub)}</small>` : ''}</span>${icon('arrow-up-right')}</a>`).join('')}</div></div></div>`); }
      else if (lang === 'terms') out.push(`<div class="tms">${buf.filter(x => x.trim()).map(x => { const i = x.indexOf('|'); return `<div class="tm"><b>${mdInline(x.slice(0, i).trim())}</b><span>${mdInline(x.slice(i + 1).trim())}</span></div>`; }).join('')}</div>`);
      else if (lang === 'tgrid' || lang === 'tgrid4' || lang === 'tgrid5') out.push(`<div class="tgrid${lang === 'tgrid4' ? ' c4' : lang === 'tgrid5' ? ' c5' : ''}">${buf.filter(x => x.trim()).map(x => { const i = x.indexOf('|'); return `<div class="tg"><b>${mdInline(x.slice(0, i).trim())}</b><span>${mdInline(x.slice(i + 1).trim())}</span></div>`; }).join('')}</div>`);
      else if (lang === 'cards') out.push(`<div class="pcs">${buf.filter(x => x.trim()).map(x => { const [n, f, d, p, c] = x.split('|').map(s => s.trim()); return `<div class="pc"><b class="pn">${mdInline(n)}</b><code>${mdInline(f)}</code><p>${mdInline(d)}</p><p class="pcl"><span class="pro"><em>Pros:</em> ${mdInline(p)}</span><span class="con"><em>Cons:</em> ${mdInline(c)}</span></p></div>`; }).join('')}</div>`);
      else if (lang === 'math') out.push(`<div class="mathb">${buf.filter(x => x.trim()).map(x => `<div>${mdEsc(x.trim()).replace(/ {2,}/g, '  ')}</div>`).join('')}</div>`);
      else if (lang === 'widget') out.push(`<div class="wg" data-widget="${mdEsc(buf.join('').trim())}"></div>`);
      else out.push(`<figure class="code">${lang ? `<figcaption>${mdEsc(lang)}</figcaption>` : ''}<pre><code>${mdCode(buf.join('\n'), lang)}</code></pre></figure>`);
    } else if ((m = l.match(/^(#{1,3})\s+(.*)/))) {
      out.push(`<h${m[1].length}>${mdInline(m[2])}</h${m[1].length}>`); i++;
    } else if (l.startsWith('>')) {
      const buf = [];
      for (; i < lines.length && lines[i].startsWith('>'); i++) buf.push(lines[i].replace(/^>\s?/, ''));
      // "> [!more] Title" is a closed dropdown (TLDR style): the rest of the quote block is read as normal Markdown, so tables and code blocks work inside it
      const mo = buf[0].match(/^\[!more\]\s*(.*)/);
      if (mo) { out.push(`<details class="more"><summary>${mdInline(mo[1])}</summary><div>${mdParse(buf.slice(1).join('\n')).html}</div></details>`); continue; }
      let text = buf.join(' '), kind = '';
      const t = text.match(/^\[!(\w+)\]\s*/);
      if (t && CALLOUTS[t[1]]) { kind = t[1]; text = text.slice(t[0].length); }
      out.push(kind
        ? `<div class="callout ${kind}"><span class="ct">${icon(CALLOUTS[kind][0])}${CALLOUTS[kind][1]}</span><span>${mdInline(text)}</span></div>`
        : `<div class="callout"><span>${mdInline(text)}</span></div>`);
    } else if (l.trim().startsWith('|') && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] || '')) {
      const head = tableCells(l), body = [];
      for (i += 2; i < lines.length && lines[i].trim().startsWith('|'); i++) body.push(tableCells(lines[i]));
      out.push(`<table class="cmp"><thead><tr>${head.map(c => `<th>${mdInline(c)}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${mdInline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
    } else if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
      const ordered = /^\s*\d+\./.test(l), buf = [];
      for (; i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i]); i++) buf.push(`<li>${mdInline(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''))}</li>`);
      out.push(`<${ordered ? 'ol' : 'ul'}>${buf.join('')}</${ordered ? 'ol' : 'ul'}>`);
    } else {
      const buf = [];
      for (; i < lines.length && lines[i].trim() && !/^(```|~~~|#{1,3}\s|>|\||\s*([-*]|\d+\.)\s)/.test(lines[i]); i++) buf.push(lines[i]);
      out.push(`<p>${mdInline(buf.join(' '))}</p>`);
    }
  }
  return { meta, html: out.join('\n') };
}

// "> [!more]" dropdowns: slide the body open and shut (a plain <details> just snaps). Click, Enter and Space all arrive here as a click on the summary.
if (!window._moreBound) {
  window._moreBound = true;
  document.addEventListener('click', e => {
    const sm = e.target.closest && e.target.closest('details.more > summary');
    if (!sm) return;
    e.preventDefault();
    const d = sm.parentElement, body = sm.nextElementSibling, opening = !d.classList.contains('is-open');
    if (d._anim) d._anim.cancel();
    d.classList.toggle('is-open', opening);
    const quick = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (opening) d.open = true;
    const cs = getComputedStyle(body), full = { height: body.offsetHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) + 'px', paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, opacity: 1 };
    const none = { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 };
    d._anim = body.animate(opening ? [none, full] : [full, none], { duration: quick ? 0 : opening ? 280 : 220, easing: 'ease' });
    d._anim.onfinish = () => { d._anim = null; if (!opening) d.open = false; };
  });
}
