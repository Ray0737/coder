// Work page: the real code files for each class, in a sidebar tree that keeps the same year > class > section shape as Main.
// A file opens as one code window on the left (the whole file, line numbers, the picked cell highlighted) with "What this cell does" and its output on the right.
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
  'ai-development/mlp': [
    {
      file: 'MLP_train_week2.py', title: 'MLP from scratch', cutAt: /^\s*#\s*===== /,
      note: 'MNIST train using a NumPy MLP from scratch.',
      does: [
        'Loads train.csv with pandas, splits off the label column as y and scales the 784 pixel columns to x by dividing by 255 (0-1 range). train_test_split holds out 10% as a validation set, stratified so every digit keeps its share, so there is data the model never trains on to check it honestly. The commented block below would preview one digit as an image with imshow if uncommented.',
        "relu(z) passes positive scores through and blocks the rest, the kink that lets stacked layers learn curves instead of one straight line; deriv_relu is relu's slope, used later to push error backward through it. softmax turns the last layer's raw scores into 10 probabilities that sum to 1.",
        "What it converts: a label like Y=3 (just one number) into a 10-row column of 0s with a single 1 at row 3, e.g. [0,0,0,1,0,0,0,0,0,0]. Why: softmax's output A2 is 10 numbers, one probability per digit, so the true label has to be reshaped into that same 10-number form before the two can be compared or subtracted.\n\nHow: oh = np.zeros((10, m)) makes an all-zero 10-row, m-column grid (m = batch size, one column per example); oh[Y, np.arange(m)] = 1 then drops a 1 into row Y[i] of column i for every example i at once, no loop needed. The result is exactly what back_prop's dZ2 = A2 - one_hot(Y) subtracts: predicted probabilities minus what should have been predicted.",
        "get_predict reads off the highest-probability class, get_accuracy compares that to the true labels. init_params and NeuralNet.__init__ fill W1, b1, W2, b2 with small random numbers: W is a per-input volume knob, b is a per-neuron trigger offset, both reshaped as training runs.",
        'One image goes through both layers: Z1 is the hidden layer\'s weighted sum (W1·X+b1), A1 = relu(Z1) is what actually fires, Z2 is the output layer\'s weighted sum, A2 = softmax(Z2) is the final probability per digit. This is the guess pass, nothing is adjusted yet.',
        "Walks the forward pass backward with the chain rule to find which way is downhill for every weight and bias. dZ2 is the output error (predicted minus true, from one_hot). dW2/db2 are its slope on W2/b2. dZ1 pushes that error back through relu's derivative to the hidden layer, giving dW1/db1. Nothing is updated here yet, just measured. (\"This chapter is more mathematically involved than the rest of the book. If you're not crazy about mathematics you may be tempted to skip the chapter, and to treat backpropagation as a black box whose details you're willing to ignore. Why take the time to study those details?\" (someone who clearly had to write this cell too).)",
        'The actual learning step: every weight and bias moves a small distance (alpha, the learning rate / LR) opposite its slope from back_prop. Too big an alpha and accuracy explodes or oscillates, too small and it stalls, the one knob to retune if training misbehaves.',
        'fit() chops the training images into batch_size chunks, reshuffled every epoch, and takes one forward_prop + back_prop + gradient step per chunk instead of one slow step over everything. Every 10th epoch it checks accuracy on the whole training set. Below the class, X/Y/X_val/Y_val are reshaped so pixels are rows and images are columns (what forward_prop expects), then a NeuralNet is built and trained for 100 epochs.',
        "Runs the trained model once on X_val, the slice it never trained on, for a real accuracy number, since training accuracy alone can hide overfitting. Then plots 90 validation digits with their true label and the model's guess, green when they match and red when they don't, since the true label is known here, unlike test.csv.",
        "test.csv has no label column (Kaggle-style: scored on submission, not told the answer), so this only produces guesses, not an accuracy number. Predictions go into submission.csv as ImageId/Label pairs, and the same grid plot repeats but shows only the guess, no color code, because there is no ground truth to check it against.",
      ],
      outs: [],
    },
    {
      file: 'layer_week3.py', title: 'Depth experiment', cutAt: /^\s*#\s*===== /,
      note: 'Depth compared: 1x10, 2x100, 3x1000.',
      does: [
        "Same MNIST load/split as MLP_train_week2.py: 784 pixel columns scaled to 0-1, 10% held out (stratified) as X_val/Y_val so there is a real accuracy to check against.",
        "sigmoid, not relu, is the activation for every hidden layer here; softmax stays on the output. one_hot, get_predict and get_accuracy are the same helpers as week 2.",
        "The big change from week 2: W1/b1/W2/b2 become self.W and self.b, Python lists built from hidden_sizes, one weight matrix and bias per layer. Pass [10] and this builds week 2's exact 1-hidden-layer shape; pass [100,100] or [1000,1000,1000] and the same class builds a 2- or 3-hidden-layer network, no new code.",
        "Loops over self.W instead of writing out Z1/A1/Z2/A2 by hand: every layer gets sigmoid except the last, which gets softmax. Z and A are lists so back_prop can walk them in reverse.",
        "Same chain-rule shape as week 2 (dZ, then dW/db, then push dZ back with deriv_sigmoid), just run backward through however many layers this network has instead of two fixed blocks.",
        "Adds two things week 2 didn't have: epoch timing (time.perf_counter per epoch) and early-stop tracking. epochs_to_target records the first epoch where val_acc reaches 85%, without actually stopping training, so different depths can be compared fairly on the same budget.",
        "Three configs from the slide: 1 layer of 10 nodes, 2 layers of 100 nodes each, 3 layers of 1000 nodes each. Same learning rate, batch size and epoch budget for all three, so depth/width is the only thing that changes between runs.",
        "Two tables: epochs needed to reach 85% validation accuracy (or '>200' if it never did), plus final accuracy and average seconds per epoch, one row per config. Then the full every-10-epochs history for each.",
      ],
      outs: [],
    },
    {
      file: 'activation_week3.py', title: 'Activation experiment', cutAt: /^\s*#\s*===== /,
      note: 'Activations compared: relu, sigmoid, tanh.',
      does: [
        "Same MNIST load/split as MLP_train_week2.py: 784 pixel columns scaled to 0-1, 10% held out (stratified) as X_val/Y_val so there is a real accuracy to check against.",
        "Three activations plus their derivatives, relu/deriv_relu, sigmoid/deriv_sigmoid, tanh/deriv_tanh, the same three from the Try it widget on the chapter page, collected in ACTIVATIONS so a name string picks out the matching (function, derivative) pair. softmax, one_hot, get_predict, get_accuracy and init_params are the same helpers as week 2.",
        "Same 1-hidden-layer shape as week 2's NeuralNet (W1/b1/W2/b2, not lists), but relu is no longer hard-coded: __init__ looks up ACTIVATIONS[activation_name] and stores the pair as self.act/self.deriv_act, so the rest of the class never needs an if/else for which activation is in use.",
        "Identical to week 2's forward_prop, except A1 = self.act(Z1) calls whichever activation this instance was built with, instead of always relu.",
        "Identical to week 2's back_prop, except dZ1 is pushed back through self.deriv_act(Z1), the derivative that matches whichever activation forward_prop used.",
        "Same early-stop and per-epoch timing as layer_week3.py's fit: records the first epoch that reaches 85% validation accuracy and the average seconds per epoch, so the three activations can be compared on how fast they learn, not just whether they eventually get there.",
        "Trains one model per entry in ACTIVATIONS (relu, sigmoid, tanh), same learning rate, batch size and epoch budget for all three, so activation choice is the only thing that changes between runs.",
        "Same two-table report as layer_week3.py: epochs to 85% validation accuracy (or '>200'), final accuracy and avg seconds/epoch per activation, then the full history.",
      ],
      outs: [],
    },
  ],
};

// where each class's files are kept: the whole-course repo (for "Copy clone link") and that class's own folder in it (for the GitHub button)
const REPOS = {
  'basic-python': { repo: 'https://github.com/eai-spsm/M.4-Classwork', folder: 'https://github.com/eai-spsm/M.4-Classwork/tree/main/Code%20-%20Basic%20Python' },
  'circuits-arduino-gpio': { repo: 'https://github.com/eai-spsm/M.4-Classwork', folder: 'https://github.com/eai-spsm/M.4-Classwork/tree/main/Code%20-%20Microcontroller' },
  'physics-in-robotics': { repo: 'https://github.com/eai-spsm/M.4-Classwork', folder: 'https://github.com/eai-spsm/M.4-Classwork/tree/main/Code%20-%20Robot' },
  'line-chatbot': { repo: 'https://github.com/eai-spsm/M.4-Classwork', folder: 'https://github.com/eai-spsm/M.4-Classwork/tree/main/Code%20-%20Line%20Dialogflow' },
  'raspberry-pi-vision': { repo: 'https://github.com/eai-spsm/M.5-Classwork', folder: 'https://github.com/eai-spsm/M.5-Classwork/tree/main/Code%20-%20Raspi' },
  'computer-vision': { repo: 'https://github.com/eai-spsm/M.5-Classwork', folder: 'https://github.com/eai-spsm/M.5-Classwork/tree/main/Code%20-%20Computer%20Vision' },
  'ai-development': { repo: 'https://github.com/eai-spsm/M.5-Classwork', folder: 'https://github.com/eai-spsm/M.5-Classwork/tree/main/Code%20-%20Deeplearn' },
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
    return files.map(f => `<li style="--c:var(--${c})"><a href="work.html#${cs}/${f.file}">${icon('code')}${esc(f.file)}</a></li>`).join('');
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
    if (cutAt.test(line)) { cells.push(cur); cur = { label: line.replace(/^\s*#+\s*/, '').replace(/=+/g, '').trim(), lines: [] }; }
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
  wmain.className = 'welcome wide wfile';
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
  // left: the whole file in one code window with line numbers (cells are marked bands inside it); right: the explanation of the picked cell
  // syntax-coloured lines; every run of four leading spaces gets a faint indent guide, like VS Code
  // extra colours on top of mdCode, like VS Code: names the code makes up (variables) are pink, %d / %.2f codes inside strings are orange,
  // and brackets cycle yellow, pink, blue by depth. mdCode already wrapped keywords, calls, numbers, strings and comments in spans, so only the loose text is left to colour.
  const colorize = html => {
    const stack = [], rainbow = ['br0', 'br1', 'br2'];
    let depth = 0;
    return html.split(/(<[^>]+>)/).map(part => {
      if (part[0] === '<') { if (part[1] === '/') stack.pop(); else stack.push((part.match(/class="([^"]*)"/) || [])[1] || ''); return part; }
      const top = stack[stack.length - 1];
      if (top === 's') return part.replace(/%[-+ 0#]*\d*(?:\.\d+)?[sdfrxXeEgGc]/g, m => `<span class="fc">${m}</span>`);
      if (stack.length) return part;
      return part.replace(/(&\w+;)|([A-Za-z_]\w*)|([()\[\]{}])/g, (m, ent, id, br) => {
        if (ent) return m;
        if (id) return `<span class="${id === 'self' ? 'sf' : /^(None|True|False)$/.test(id) ? 'n' : 'v'}">${id}</span>`;
        if ('([{'.includes(br)) return `<span class="${rainbow[depth++ % 3]}">${br}</span>`;
        depth = Math.max(0, depth - 1);
        return `<span class="${rainbow[depth % 3]}">${br}</span>`;
      });
    }).join('');
  };
  // VS Code's Python grammar (MagicPython) puts float, int, str, type, list and the other built-in TYPES in their own scope (support.type), apart from built-in functions such as print and input
  const PYTYPES = /<span class="b">(bool|bytearray|bytes|classmethod|complex|dict|float|frozenset|int|list|object|property|set|slice|staticmethod|str|super|tuple|type)<\/span>/g;
  const hl = code => colorize(mdCode(code, 'python').replace(PYTYPES, '<span class="ty">$1</span>').replace(/(<span class="k">def<\/span> )<span class="b">/g, '$1<span class="fn">').replace(/(<span class="k">class<\/span> )([A-Za-z_]\w*)/g, '$1<span class="y">$2</span>')).split('\n').map(l => (/\bf["']/.test(l) ? l.replace(/\{[^{}<>]*\}/g, m => `<span class="fi">${m}</span>`) : l).replace(/^( +)/, m => m.replace(/ {4}/g, '<span class="ig">    </span>'))).join('\n');
  let lineNo = 1;
  const segs = cells.map((c, i) => {
    const n = c.code.split('\n').length, nums = Array.from({ length: n }, (_, k) => lineNo + k).join('\n');
    lineNo += n;
    return `<section class="wseg" tabindex="0" data-i="${i}"><span class="wtag">In [${i + 1}] \u00b7 ${esc(c.label)}</span><pre class="gut">${nums}</pre><pre class="src"><code>${hl(c.code)}</code></pre></section>`;
  }).join('');
  wmain.innerHTML = `<div class="wgrid">
      <div class="wwin vs">
        <div class="vedit"><div class="wbody" id="wbody">${segs}</div></div>
      </div>
      <aside class="wside">
        <div class="wtop"><span class="ni" style="--c:var(--${folder[2]})">${icon('code')}</span><div><h1>${esc(f.file)}</h1><p class="sum">${esc(f.note)}</p></div></div>
        <div class="cft" style="margin:0 0 16px;padding:0;border:0"><a class="btn ghost" href="${REPOS[f.cs].folder}" target="_blank" rel="noopener">${icon('github-logo')}<span>GitHub</span></a><button class="btn ghost" id="wcopy" type="button">${icon('notebook')}<span>Copy clone link</span></button></div>
        <div class="cpanel">
          <div class="chd"><span class="ni">${icon('lightbulb')}</span><div><b>What this cell does</b><i id="cwhich"></i></div>
            <span class="cnav"><button type="button" id="cprev" data-tip="Previous cell">${icon('caret-left')}</button><button type="button" id="cnext" data-tip="Next cell">${icon('caret-right')}</button></span></div>
          <b id="ctopic"></b>
          <div id="cdoes"></div>
          <div class="cout" id="cout"></div>
          <div class="cft"><a class="btn ghost" href="${pathById(f.chapter)}">${icon('file-text')}<span>Read the chapter</span></a></div>
        </div>
      </aside>
    </div>`;

  let cur = 0;
  // code-looking words in a description (%d, print(), \\n, **) are set in code type so they stand out
  const say = t => esc(t).replace(/(%\.?\d*[dsf]|\b[\w.]+\(\)|\\n|\*\*|\bmath\.pi\b|\bTrue\b|\bFalse\b)/g, '<code>$1</code>');
  const body = $('#wbody');
  const pick = (i, scroll) => {
    cur = i;
    const all = $$('.wseg');
    all.forEach(el => el.classList.toggle('on', +el.dataset.i === i));
    $('#cdoes').innerHTML = f.does[i] ? f.does[i].split('\n\n').map(p => `<p>${say(p)}</p>`).join('') : '<p>No description yet.</p>';
    $('#cwhich').textContent = `In [${i + 1}] \u00b7 ${i + 1} of ${cells.length}`;
    $('#ctopic').textContent = cells[i].label;
    $('#cout').innerHTML = f.outs[i] ? `<span class="ocl">Output</span><pre>${esc(f.outs[i])}</pre>` : '';
    $('#cout').hidden = !f.outs[i];
    $('#cprev').disabled = i === 0;
    $('#cnext').disabled = i === cells.length - 1;
    if (scroll) body.scrollTo({ top: Math.max(0, all[i].offsetTop - 8), behavior: 'smooth' });
  };
  const flash = (btn, text) => {
    const s = btn.querySelector('span');
    if (s) { const old = s.textContent; s.textContent = text; setTimeout(() => s.textContent = old, 1400); return; }
    const old = btn.dataset.tip; btn.dataset.tip = text; setTimeout(() => btn.dataset.tip = old, 1400);
  };
  const copy = (text, btn) => (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => flash(btn, 'Copied')).catch(() => {});
  body.addEventListener('click', e => { const c = e.target.closest('.wseg'); if (c) pick(+c.dataset.i); });
  body.addEventListener('keydown', e => { const c = e.target.closest('.wseg'); if (c && e.target === c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(+c.dataset.i); } });
  $('#wcopy').onclick = () => copy(REPOS[f.cs].repo + '.git', $('#wcopy'));
  $('#cprev').onclick = () => pick(cur - 1, true);
  $('#cnext').onclick = () => pick(cur + 1, true);
  pick(0);

  $('.view').scrollTop = 0;
}

addEventListener('hashchange', showWork);
showWork();
