// Work page: the real code files for each class, in a sidebar tree that keeps the same year > class > section shape as Main.
// A file opens as cells on the left (code, and its real output when it has one) with "What this cell does" on the right.
// A chapter that has work lists its files; a chapter without any shows dimmed.
// To add work: copy the file into work/<class-slug>/ and add it here. See work/README.md.
// The file is read with fetch, so the site has to be served (see content/README.md).

// A file is cut into cells at lines like "#Q1" or "# Exercise 3-4" (cutAt). The text before the first one is the header cell.
// does[i] describes cell i (header first). outs[i] is the output of cell i, when it has one that never changes.
const WORK = {
  'basic-python/printing-and-getting-input': [
    {
      file: 'W01.py', title: 'Print', cutAt: /^#\s*Q\d+/i,
      note: 'Week 01: strings, variables and the print command.',
      does: [
        'The label at the top of the file. Text in triple quotes is a docstring: Python ignores it when running, and it just says what the file is for.',
        'Two variables, then one print with five %d blanks. The values in the brackets fill the blanks in order: a, b, b, a and a+b. The output reads 2 + 3 = 3 + 2 = 5, so the same pair added in either order gives the same sum.',
        'Three variables fill seven %d blanks. One variable can fill more than one blank, so a is used three times and b and c twice. The print shows the distributive law as written text, 2*(3+5) = 2*3+2*5. It prints the pieces, not the answer.',
        '%.2f fills the blank with a decimal rounded to two places. The values are b, a and b-a, so it prints 2.50 - 2.40 = 0.10. Plain %f would show six decimal places.',
        'Strings can hold Thai text. %d drops the whole number 25 into the sentence.',
        'A lone % starts a code, so a plain percent sign is awkward to type inside the text. Here the % is saved in a variable and filled in with %s, which fills a blank with text.',
        'All three codes in one line: %d for the whole number 2, %.2f for the decimal 3.5 (shown as 3.50), and %s for the percent sign, used twice.',
      ],
      outs: [null, '2 + 3 = 3 + 2 = 5', '2*(3+5) = 2*3+2*5', '2.50 - 2.40 = 0.10', 'ฉันเกิดวันที่ 25 ธันวาคม', 'ฉันได้กำไร 5%', 'เมื่อวานฉันขาดทุน 2% วันนี้ฉันได้กำไร 3.50%'],
    },
    {
      file: 'W02.py', title: 'Input', cutAt: /^#\s*Exercise\s*[\d-]+/i,
      note: 'Week 02: the input command.',
      does: [
        'The label for week 2. The whole file is about input(), which asks the user to type something.',
        'input() shows the question and waits for you to type. Whatever you type comes back as text, so type(a) says str even if you typed a number. The f-string prints the value and its type.',
        'Asks for a name and prints it with the type of what you entered. The \\n inside the text starts a new line.',
        'Two numbers read with float(), so the maths works. It adds, subtracts, multiplies and divides, and prints each answer with its type. Every answer is a float, because dividing with / always gives a float.',
        'A decimal and a whole number together. The answer is a float, because Python turns the whole number into a decimal before it adds or subtracts.',
        'A physics formula as a program: work = force x distance, and power = work / time. It asks for the force in newtons, the distance in metres and the time, and prints the answers in joules and watts.',
        'Several inputs used in one sentence. The two ages are read with int() so they can be subtracted to give the age gap. The first name and surname stay as text.',
        'Comparing two numbers with > gives True or False. That value is a bool, and type() confirms it.',
        'The first import of the course. import math gives you math.pi, and the cone\'s volume is one third times pi times the radius squared times the height. ** means to the power of.',
      ],
      outs: [],
    },
  ],
};

const wmain = $('#wmain');
const wItems = Object.entries(WORK).flatMap(([chapter, files]) => files.map(f => ({ ...f, chapter, cs: chapter.split('/')[0] })));
const wId = f => f.cs + '/' + f.file;

// ---- the sidebar: same hierarchy as Main, but the chapters that have work are replaced by their real files
$('#p-main h2').textContent = 'Work';
let wYr = '';
$('#tree').innerHTML = notes.map(([g, ic, c, ns, yr]) => {
  const head = yr !== wYr ? `<p class="yr">${yr}</p>` : '';
  wYr = yr;
  const cs = slug(g);
  const items = ns.map(n => {
    if (n.startsWith('# ')) return `<li class="sub">${esc(n.slice(2))}</li>`;
    if (n === 'Coming soon') return '<li class="todo"><span>Coming soon</span></li>';
    const files = WORK[cs + '/' + slug(n)];
    if (!files) return `<li class="todo" style="--c:var(--${c})"><span>${icon('file-text')}${esc(n)}</span></li>`;
    return files.map(f => `<li style="--c:var(--${c})"><a href="work.html#${cs}/${f.file}">${icon('code')}${esc(f.file)}<i>${esc(f.title)}</i></a></li>`).join('');
  }).join('');
  return head + `<button class="grp" style="--c:var(--${c})" aria-expanded="false" data-g="${esc(g)}">${icon('caret-right')}<svg class="i f"><use href="#i-${ic}"/></svg><span>${esc(g)}</span></button><ul class="tree">${items}</ul>`;
}).join('');
(load('coder:open') || []).forEach(g => { const b = [...$$('.grp')].find(x => x.dataset.g === g); if (b) paintGroup(b, true); });

// ---- the main panel
function setHead(title, crumb) {
  document.title = title + ' · Coder';
  $('#wtab span').textContent = title;
  $('#wcrumb').textContent = crumb;
}

// cut a file into cells; the text before the first marker is the header cell
function cutCells(code, cutAt) {
  const cells = [];
  let cur = { label: 'Header', lines: [] };
  code.split('\n').forEach(line => {
    if (cutAt.test(line)) { cells.push(cur); cur = { label: line.replace(/^#\s*/, '').trim(), lines: [] }; }
    cur.lines.push(line);
  });
  cells.push(cur);
  return cells.map(c => ({ label: c.label, code: c.lines.join('\n').replace(/\s+$/, '').replace(/^\n+/, '') }));
}

async function showWork() {
  const id = decodeURIComponent(location.hash.slice(1));
  $$('#tree a.on').forEach(a => a.classList.remove('on'));
  const f = wItems.find(x => wId(x) === id);
  if (!f) {
    setHead('Work', 'Coder › Work');
    wmain.className = 'welcome';
    wmain.innerHTML = `
      <h1>Coder</h1>
      <p class="lead">Code, circuits, robots and AI, one chapter at a time</p>
      <div class="cols">
        <div>
          <section>
            <h3>Start</h3>
            <ul class="links">
              <li><a href="#" data-open="main">${icon('folder-open')}Browse notes</a></li>
              <li><a href="#" data-cmd>${icon('magnifying-glass')}Go to a chapter</a></li>
              <li><a href="#" data-group="Basic Python">${icon('terminal-window')}Open Python</a></li>
              <li><a href="#" data-group="AI Development">${icon('brain')}Open AI Development</a></li>
              <li><a href="tools.html">${icon('wrench')}Recommended tools</a></li>
            </ul>
          </section>
          <section>
            <h3>Recent</h3>
            <ul class="links" id="recent"></ul>
          </section>
        </div>
        <div>
          <section class="walk">
            <h3>Walkthroughs</h3>
            <a href="#" data-group="Basic Python">${icon('terminal-window')}<span><b>Start with Python</b>From print() up to a Tkinter app</span></a>
            <a href="#" data-group="Circuits, Arduino &amp; GPIO">${icon('cpu')}<span><b>Circuits to robots</b>Ohm's law, Arduino, ESP32, Raspberry Pi</span></a>
            <a href="#" data-group="AI Development">${icon('brain')}<span><b>AI Development</b>From AI vs ML up to LLMs</span></a>
            <a href="#" data-open="main">${icon('lightbulb')}<span><b>How notes work</b>Each chapter is one file, read top to bottom</span></a>
          </section>
        </div>
      </div>
      <div class="cols more">
        <section>
          <h3>Our Major</h3>
          <ul class="links">
            <li><a href="major.html">${icon('graduation-cap')}About the major</a><span class="dim">What it is and its classes</span></li>
            <li><a href="projects.html">${icon('cube')}Projects</a><span class="dim">What we built in class</span></li>
            <li><a href="materials.html">${icon('books')}Materials</a><span class="dim">Class files and code</span></li>
          </ul>
        </section>
        <section>
          <h3>Your data</h3>
          <p class="note">Chapters done, your notes and the chapters you opened stay in this browser. Nothing is sent anywhere. Open a chapter from <a href="#" data-open="main">Main</a> to read or write its notes.</p>
        </section>
      </div>
      <p class="startup">${icon('list-checks')}Pick a file in Main to begin</p>`;
    const recent = $('#recent');
    if (recent) recent.innerHTML = (load('coder:recent') || [])
      .map(s => all.find(x => slug(x.g) + '/' + slug(x.n) === s)).filter(Boolean)
      .map(x => `<li><a href="${href(x.g, x.n)}">${esc(x.n)}</a><span class="dim">${esc(x.g)}</span></li>`).join('');
    $$('#wmain [data-open]').forEach(a => a.onclick = e => { e.preventDefault(); open(); });
    $$('#wmain [data-group]').forEach(a => a.onclick = e => { e.preventDefault(); open(); $$('.grp').forEach(b => setGroup(b, b.dataset.g === a.dataset.group)); });
    $$('#wmain [data-cmd]').forEach(a => a.onclick = e => { e.preventDefault(); cmd.focus(); });
    return;
  }
  wmain.className = 'welcome wide';
  const folder = notes.find(n => slug(n[0]) === f.cs);
  setHead(f.file, `Coder › Work › ${folder[0]} › ${f.file}`);
  const a = $(`#tree a[href="work.html#${id}"]`);
  if (a) { a.classList.add('on'); const grp = a.closest('ul').previousElementSibling; if (grp && grp.classList.contains('grp')) setGroup(grp, true); }

  const path = `work/${f.cs}/${f.file}`;
  let code = null;
  try { const r = await fetch(path); if (r.ok) code = await r.text(); } catch {}
  if (code === null) {
    wmain.innerHTML = `<h1>${esc(f.file)}</h1><p class="sum">${location.protocol === 'file:' ? 'This page reads the file from disk, so it needs to be opened through a local server such as VS Code Live Server.' : 'This file could not be loaded.'}</p>`;
    return;
  }
  code = code.replace(/\r\n?/g, '\n');
  const cells = cutCells(code, f.cutAt);
  wmain.innerHTML = `<div class="wgrid">
      <div class="wcells">${cells.map((c, i) => `<section class="wcell" tabindex="0" data-i="${i}"><span class="cin">In [${i + 1}]<em>${esc(c.label)}</em></span><pre><code>${mdCode(c.code, 'python')}</code></pre>${f.outs[i] ? `<div class="cout"><span class="cin ocl">Out [${i + 1}]</span><pre>${esc(f.outs[i])}</pre></div>` : ''}</section>`).join('')}</div>
      <aside class="wside">
        <div class="wtop"><span class="ni" style="--c:var(--${folder[2]})">${icon('code')}</span><div><h1>${esc(f.file)}</h1><p class="sum">${esc(f.note)}</p></div></div>
        <div class="wact">
          <button class="btn ghost" id="wcopy" type="button" data-tip="Copy file">${icon('notebook')}</button>
          <a class="btn ghost" href="${path}" download="${esc(f.file)}" data-tip="Download">${icon('arrow-up-right')}</a>
          <a class="btn ghost" href="${pathById(f.chapter)}" data-tip="Read the chapter">${icon('file-text')}</a>
        </div>
        <div class="cpanel">
          <div class="chd"><span class="ni">${icon('lightbulb')}</span><div><b>What this cell does</b><i id="cwhich"></i></div>
            <span class="cnav"><button type="button" id="cprev" data-tip="Previous cell">${icon('caret-left')}</button><button type="button" id="cnext" data-tip="Next cell">${icon('caret-right')}</button></span></div>
          <p id="cdoes"></p>
          <div class="cft"><button class="btn ghost" id="ccopy" type="button">${icon('notebook')}<span>Copy this cell</span></button><span id="cpos"></span></div>
        </div>
      </aside>
    </div>`;

  let cur = 0;
  // code-looking words in a description (%d, print(), \\n, **) are set in code type so they stand out
  const say = t => esc(t).replace(/(%\.?\d*[dsf]|\b[\w.]+\(\)|\\n|\*\*|\bmath\.pi\b|\bTrue\b|\bFalse\b)/g, '<code>$1</code>');
  const pick = (i, scroll) => {
    cur = i;
    $$('.wcell').forEach(el => el.classList.toggle('on', +el.dataset.i === i));
    $('#cdoes').innerHTML = f.does[i] ? say(f.does[i]) : 'No description yet.';
    $('#cwhich').textContent = `In [${i + 1}] \u00b7 ${cells[i].label}`;
    $('#cpos').textContent = `${i + 1} of ${cells.length}`;
    $('#cprev').disabled = i === 0;
    $('#cnext').disabled = i === cells.length - 1;
    if (scroll) $$('.wcell')[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
  const flash = (btn, text) => {
    const s = btn.querySelector('span');
    if (s) { const old = s.textContent; s.textContent = text; setTimeout(() => s.textContent = old, 1400); return; }
    const old = btn.dataset.tip; btn.dataset.tip = text; setTimeout(() => btn.dataset.tip = old, 1400);
  };
  const copy = (text, btn) => (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => flash(btn, 'Copied')).catch(() => {});
  $('.wcells').addEventListener('click', e => { const c = e.target.closest('.wcell'); if (c) pick(+c.dataset.i); });
  $('.wcells').addEventListener('keydown', e => { const c = e.target.closest('.wcell'); if (c && e.target === c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(+c.dataset.i); } });
  $('#wcopy').onclick = () => copy(code, $('#wcopy'));
  $('#ccopy').onclick = () => copy(cells[cur].code, $('#ccopy'));
  $('#cprev').onclick = () => pick(cur - 1, true);
  $('#cnext').onclick = () => pick(cur + 1, true);
  pick(0);
  $('.view').scrollTop = 0;
}

addEventListener('hashchange', showWork);
showWork();
