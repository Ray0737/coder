// The note editor, shared by the chapter page (beside the lesson) and the Notes page (one note on its own).
// Needs shell.js and md.js first. A note is saved on this device as coder:notes:<class>/<chapter>.

const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// a day counts for the streak when you finish a chapter or write a note
function touchStreak() {
  const day = d => d.toISOString().slice(0, 10);
  const today = day(new Date()), yest = day(new Date(Date.now() - 864e5));
  const s = load('coder:streak') || { last: '', days: 0 };
  if (s.last === today) return;
  writeJSON('coder:streak', { last: today, days: s.last === yest ? s.days + 1 : 1 });
}

// opts.clip: a function that returns the text to clip (the chapter page passes the lesson selection); leave it out for no Clip button
// opts.onSave: called after every save
function mountNote(pane, id, opts = {}) {
  const key = 'coder:notes:' + id;
  pane.innerHTML = `<div class="nh"><b>Your note</b><span class="nstat">Saved on this device</span></div>
    <div class="ntool" role="toolbar" aria-label="Note tools">
      <button type="button" data-t="bold" data-tip="Bold"><b>B</b></button>
      <button type="button" data-t="italic" data-tip="Italic"><i>I</i></button>
      <button type="button" data-t="code" data-tip="Inline code">&lt;/&gt;</button>
      <button type="button" data-t="block" data-tip="Code block">{ }</button>
      <button type="button" data-t="list" data-tip="Bullet list">List</button>
      ${opts.clip ? '<button type="button" data-t="clip" data-tip="Add the text you selected in the lesson">Clip</button>' : ''}
      <span class="sp"></span>
      <button type="button" data-t="copy" data-tip="Copy this note">Copy</button>
      <button type="button" data-t="view" class="nview" data-tip="Switch between writing and preview">Preview</button>
    </div>
    <textarea class="nta" placeholder="${opts.clip ? 'Write what you want to remember. Select text in the lesson and press Clip to add it here.' : 'Write what you want to remember.'}"></textarea>
    <div class="pv lesson npv" hidden></div>`;
  const mn = pane.querySelector('.nta'), pv = pane.querySelector('.npv'), stat = pane.querySelector('.nstat'), viewBtn = pane.querySelector('.nview');
  mn.id = 'mn';
  mn.value = load(key) || '';
  const save = () => {
    try { mn.value.trim() ? localStorage.setItem(key, JSON.stringify(mn.value)) : localStorage.removeItem(key); } catch {}
    stat.textContent = 'Saved on this device';
    if (mn.value.trim()) touchStreak();
    if (opts.onSave) opts.onSave(mn.value);
  };
  mn.oninput = save;
  const put = (text, from = mn.selectionStart, to = mn.selectionEnd) => {
    mn.setRangeText(text, from, to, 'end');
    mn.focus(); save();
  };
  const wrap = (l, r = l) => {
    const a = mn.selectionStart, b = mn.selectionEnd, sel = mn.value.slice(a, b) || 'text';
    put(l + sel + r, a, b);
  };
  const tools = {
    bold: () => wrap('**'),
    italic: () => wrap('*'),
    code: () => wrap('`'),
    block: () => {
      const a = mn.selectionStart, b = mn.selectionEnd, sel = mn.value.slice(a, b) || 'print("hello")';
      put('\n```python\n' + sel + '\n```\n', a, b);
    },
    list: () => {
      const a = mn.selectionStart, b = mn.selectionEnd, sel = mn.value.slice(a, b) || 'item';
      put(sel.split('\n').map(l => '- ' + l).join('\n'), a, b);
    },
    clip: () => {
      const text = opts.clip && opts.clip();
      if (!text) { stat.textContent = 'Select some text in the lesson first'; return; }
      put((mn.value && !mn.value.endsWith('\n') ? '\n' : '') + '> ' + text.replace(/\n+/g, ' ') + '\n', mn.value.length, mn.value.length);
    },
    copy: () => {
      const done = () => { stat.textContent = 'Copied'; };
      (navigator.clipboard ? navigator.clipboard.writeText(mn.value).then(done) : Promise.reject()).catch(() => { mn.select(); document.execCommand('copy'); done(); });
    },
    view: () => {
      const on = pv.hidden;
      if (on) pv.innerHTML = mn.value.trim() ? mdParse(mn.value).html : '<p>Nothing written yet.</p>';
      pv.hidden = !on; mn.hidden = on;
      viewBtn.textContent = on ? 'Edit' : 'Preview';
      pane.querySelectorAll('.ntool button:not(.nview)').forEach(b => b.disabled = on);
    },
  };
  pane.querySelectorAll('.ntool button').forEach(b => b.onclick = () => tools[b.dataset.t]());
}
