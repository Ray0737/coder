// Shared Markdown reader: used by chapter.js (lessons and the note preview) and notes.html (your notes).
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
const PY = /(#.*)|([fFrRbB]{0,2}(?:"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|\b(\d+(?:\.\d+)?)\b|\b(def|class|if|elif|else|for|while|in|not|and|or|return|import|from|as|True|False|None|pass|break|continue|try|except|with|lambda)\b|\b(print|input|int|float|str|len|range|type|list|dict|tuple|set|open|round|abs|sum|min|max)(?=\()/g;
function mdCode(code, lang) {
  if (lang !== 'python') return mdEsc(code);
  let out = '', last = 0, m;
  PY.lastIndex = 0;
  while ((m = PY.exec(code))) {
    out += mdEsc(code.slice(last, m.index));
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'n' : m[4] ? 'k' : 'b';
    out += `<span class="${cls}">${mdEsc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + mdEsc(code.slice(last));
}

// note boxes: "> text" is a plain note; "> [!aha] text" is a coloured one (aha, compare, tip, warn)
const CALLOUTS = { aha: ['lightbulb', 'Aha!'], compare: ['puzzle-piece', 'Think of it like'], tip: ['sparkle', 'Tip'], warn: ['warning', 'Careful'] };

const tableCells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

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
      if (lang === 'widget') out.push(`<div class="wg" data-widget="${mdEsc(buf.join('').trim())}"></div>`);
      else out.push(`<figure class="code">${lang ? `<figcaption>${mdEsc(lang)}</figcaption>` : ''}<pre><code>${mdCode(buf.join('\n'), lang)}</code></pre></figure>`);
    } else if ((m = l.match(/^(#{1,3})\s+(.*)/))) {
      out.push(`<h${m[1].length}>${mdInline(m[2])}</h${m[1].length}>`); i++;
    } else if (l.startsWith('>')) {
      const buf = [];
      for (; i < lines.length && lines[i].startsWith('>'); i++) buf.push(lines[i].replace(/^>\s?/, ''));
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
