// Chapter page: reads content/<class>/<chapter>.md for the chapter named in the address (chapter.html#class-slug/chapter-slug)
// and draws it. The class and chapter names come from `notes` in shell.js; see content/README.md.

// ---- live widgets: a fenced block with the language "widget" and a name inside draws one of these
const widgets = {
  // fill in the blanks of an f-string and watch the sentence change
  fstring(el) {
    el.innerHTML = `<p class="wgt">Try it: fill in the blanks</p>
      <div class="wgrow"><label>name <input id="w-name" value="Mint" maxlength="14"></label><label>score <input id="w-score" type="number" value="95"></label></div>
      <figure class="code"><figcaption>python</figcaption><pre><code id="w-code"></code></pre></figure>
      <p class="wgo">Screen shows: <b id="w-out"></b></p>`;
    const run = () => {
      const n = $('#w-name').value, s = $('#w-score').value || '0';
      $('#w-code').innerHTML = mdCode(`name = "${n}"\nscore = ${s}\nprint(f"{name} scored {score} points")`, 'python');
      $('#w-out').textContent = `${n} scored ${s} points`;
    };
    el.addEventListener('input', run); run();
  },
  // type anything and see why input() text needs int() before you can add to it
  inputtype(el) {
    el.innerHTML = `<p class="wgt">Try it: type into input()</p>
      <div class="wgrow"><label>You type <input id="w-age" value="15" maxlength="10"></label></div>
      <div class="wgtable" id="w-rows"></div>`;
    const run = () => {
      const v = $('#w-age').value;
      const num = v.trim() !== '' && !isNaN(Number(v)) && /^-?\d+$/.test(v.trim());
      const row = (code, res, bad) => `<div><code>${mdEsc(code)}</code><span class="${bad ? 'bad' : 'ok'}">${mdEsc(res)}</span></div>`;
      $('#w-rows').innerHTML =
        row('age = input("How old are you? ")', `age is the text '${v}'`) +
        row('type(age)', "<class 'str'>") +
        row('age + 1', `TypeError: can only concatenate str (not "int") to str`, true) +
        row('int(age) + 1', num ? String(Number(v.trim()) + 1) : `ValueError: invalid literal for int()`, !num);
    };
    el.addEventListener('input', run); run();
  },
};

// ---- the page
const lessonEl = $('#lesson');
function showMessage(h, p) { lessonEl.innerHTML = `<h1>${h}</h1><p class="sum">${p}</p>`; }

function setTitle(title, entry) {
  document.title = title + ' · Coder';
  $('#ctab span').textContent = title;
  $('#ccrumb').textContent = entry ? `Coder › ${entry.g} › ${title}` : 'Coder › Chapter';
}

// the < > buttons at the top right go to the previous and next topic
function setNav(a, x, label) {
  if (x) { a.href = `chapter.html#${slug(x.g)}/${slug(x.n)}`; a.dataset.tip = `${label}: ${x.n}`; a.classList.remove('off'); }
  else { a.removeAttribute('href'); a.dataset.tip = `No ${label.toLowerCase()}`; a.classList.add('off'); }
}

function markSidebar(id) {
  $$('#tree a.on').forEach(a => a.classList.remove('on'));
  const a = $(`#tree a[href="chapter.html#${id}"]`);
  if (!a) return;
  a.classList.add('on');
  const grp = a.closest('ul').previousElementSibling;
  if (grp && grp.classList.contains('grp')) setGroup(grp, true);
}

// ---- the note panel: sits beside the lesson when there is room, under it when there is not (see the container queries in style.css)
let lastSel = '';
document.addEventListener('selectionchange', () => {
  const sel = getSelection();
  if (sel && sel.toString().trim() && lessonEl.contains(sel.anchorNode)) lastSel = sel.toString().trim();
});

function buildNote(id) { mountNote($('#notepane'), id, { clip: () => lastSel }); }

// layout by the width of the main panel: wide = equal split, mid = lesson a bit wider, narrow = no split and the note slides over from the right
const chap = $('#chap'), ntoggle = $('#ntoggle'), cview = $('.cview');
const fit = () => {
  const w = cview.clientWidth - 64;
  chap.classList.toggle('wide', w >= 1100);
  chap.classList.toggle('mid', w >= 820 && w < 1100);
  chap.classList.toggle('narrow', w < 820);
  paintToggle();
};
const paintToggle = () => {
  const open = chap.classList.contains('narrow') ? chap.classList.contains('drawer') : !chap.classList.contains('nonote');
  ntoggle.classList.toggle('on', open);
  ntoggle.querySelector('span').textContent = open ? (chap.classList.contains('narrow') ? 'Close note' : 'Hide note') : 'Open note';
};
if (load('coder:notepane') === 'off') chap.classList.add('nonote');
ntoggle.onclick = () => {
  if (chap.classList.contains('narrow')) chap.classList.toggle('drawer');
  else {
    chap.classList.toggle('nonote');
    try { localStorage.setItem('coder:notepane', JSON.stringify(chap.classList.contains('nonote') ? 'off' : 'on')); } catch {}
  }
  paintToggle();
};
// the "Open note" button in the card at the end of a chapter: show the note panel (or slide it in) and start typing
function openNote() {
  if (chap.classList.contains('narrow')) chap.classList.add('drawer');
  else chap.classList.remove('nonote');
  paintToggle();
  const mn = $('#mn');
  if (mn && !mn.hidden) mn.focus();
}
new ResizeObserver(fit).observe(cview);
fit();

async function loadChapter() {
  const id = decodeURIComponent(location.hash.slice(1));
  const idx = all.findIndex(x => slug(x.g) + '/' + slug(x.n) === id);
  if (idx < 0) { setNav($('#tprev'), null, 'Previous topic'); setNav($('#tnext'), null, 'Next topic'); $('#notepane').innerHTML = ''; setTitle('Chapter'); showMessage('Chapter not found', 'Pick one from the list on the left.'); return; }
  const entry = all[idx];
  setTitle(entry.n, entry);
  markSidebar(id);
  buildNote(id);
  setNav($('#tprev'), all[idx - 1], 'Previous topic');
  setNav($('#tnext'), all[idx + 1], 'Next topic');
  const recent = (load('coder:recent') || []).filter(s => s !== id);
  writeJSON('coder:recent', [id, ...recent].slice(0, 5));

  let text = null;
  try {
    const r = await fetch(`content/${id}.md`);
    if (r.ok) text = await r.text();
  } catch {}
  if (text === null) {
    const local = location.protocol === 'file:';
    lessonEl.innerHTML = `<h1>${esc(entry.n)}</h1><p class="sum">${local ? 'This page reads its text from a file, so it needs to be opened through a local server such as VS Code Live Server.' : 'This chapter is not written yet.'}</p>`;
    return;
  }
  const { meta, html } = mdParse(text);
  const title = meta.title || entry.n;
  setTitle(title, entry);
  const prev = all[idx - 1], next = all[idx + 1];
  const to = x => `chapter.html#${slug(x.g)}/${slug(x.n)}`;
  lessonEl.innerHTML = `<h1>${esc(title)}</h1>${meta.summary ? `<p class="sum">${mdEsc(meta.summary)}</p>` : ''}${html}
    <div class="cta">
      <div class="ctat"><b>Finished this chapter?</b><span>Jot it down, tick it off, then keep going.</span>${prev ? `<a class="prevlink" href="${to(prev)}">${icon('caret-left')}Previous: ${esc(prev.n)}</a>` : ''}</div>
      <div class="ctab">
        <button class="btn ghost" id="opennote" type="button">${icon('notebook')}Open note</button>
        <button class="btn ghost" id="mark" type="button"></button>
        ${next ? `<a class="btn" href="${to(next)}"><span>Move on to ${esc(next.n)}</span>${icon('caret-right')}</a>` : `<a class="btn" href="roadmap.html"><span>Back to the roadmap</span>${icon('caret-right')}</a>`}
      </div>
    </div>`;
  $('#opennote').onclick = openNote;
  $$('[data-widget]').forEach(el => widgets[el.dataset.widget] && widgets[el.dataset.widget](el));
  const mark = $('#mark');
  const paint = () => {
    const isDone = (load('coder:done') || []).includes(id);
    mark.innerHTML = icon('check-circle') + (isDone ? 'Done' : 'Mark as done');
    mark.classList.toggle('on', isDone);
    const f = $('#done');
    if (f && f.lastChild) f.lastChild.textContent = (load('coder:done') || []).length + '/' + all.length + ' done';
  };
  mark.onclick = () => {
    const d = load('coder:done') || [];
    writeJSON('coder:done', d.includes(id) ? d.filter(s => s !== id) : [...d, id]);
    if (!d.includes(id)) touchStreak();
    paint();
  };
  paint();
  $('.view').scrollTop = 0;
}

addEventListener('hashchange', loadChapter);
loadChapter();
