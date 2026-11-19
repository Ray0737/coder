// Chapter page: reads content/<class>/<chapter>.md for the chapter named in the address (chapter.html#class-slug/chapter-slug)
// and draws it. The class and chapter names come from `notes` in shell.js; see content/README.md.

// ---- tiny helpers shared by the neural-net diagrams below
// draws a column-by-column network: counts is neurons per layer, e.g. [3,4,4,1]
function nnSVG(counts, opts = {}) {
  const w = opts.w || 460, h = opts.h || 190, r = 11, padX = 36, padTop = 14, padBottom = opts.labels ? 22 : 8;
  const innerH = h - padTop - padBottom;
  const xs = counts.map((_, i) => padX + i * ((w - 2 * padX) / Math.max(counts.length - 1, 1)));
  const ys = counts.map(n => { const gap = innerH / (n + 1); return Array.from({ length: n }, (_, k) => padTop + gap * (k + 1)); });
  let lines = '';
  for (let i = 0; i < counts.length - 1; i++) ys[i].forEach(y1 => ys[i + 1].forEach(y2 => lines += `<line x1="${xs[i]}" y1="${y1}" x2="${xs[i + 1]}" y2="${y2}" stroke="var(--s1)"/>`));
  let nodes = '';
  counts.forEach((n, i) => ys[i].forEach(y => nodes += `<circle cx="${xs[i]}" cy="${y}" r="${r}" fill="var(--base)" stroke="${i === counts.length - 1 ? 'var(--mauve)' : 'var(--sub0)'}" stroke-width="1.5"/>`));
  let labels = '';
  if (opts.labels) opts.labels.forEach((t, i) => labels += `<text x="${xs[i]}" y="${h - 6}" text-anchor="middle" fill="var(--o1)" font-size="11">${mdEsc(t)}</text>`);
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}">${lines}${nodes}${labels}</svg>`;
}
// a simple seeded random generator, so a diagram looks the same every time it draws for the same epoch
const seeded = seed => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

// a labelled line-plot: series is [{pts:[[x,y],...], color, dash}], opts sets the axis domain and optional markers
function curveSVG(series, opts = {}) {
  const w = opts.w || 360, h = opts.h || 190, x0 = 46, x1 = w - 18, y0 = h - 30, y1 = 14;
  const { xMin, xMax, yMin, yMax } = opts;
  const xAt = x => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const yAt = y => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  const xN = opts.xTicksN || 5, yN = opts.yTicksN || 4;
  const xTicks = Array.from({ length: xN }, (_, i) => xMin + (xMax - xMin) * i / (xN - 1));
  const yTicks = Array.from({ length: yN }, (_, i) => yMin + (yMax - yMin) * i / (yN - 1));
  const tickText = t => Number(t.toFixed(2));
  const grid = xTicks.map(t => `<line x1="${xAt(t)}" y1="${y1}" x2="${xAt(t)}" y2="${y0}" stroke="var(--s0)"/>`).join('')
    + yTicks.map(t => `<line x1="${x0}" y1="${yAt(t)}" x2="${x1}" y2="${yAt(t)}" stroke="var(--s0)"/>`).join('');
  const xLabels = xTicks.map(t => `<text x="${xAt(t)}" y="${y0 + 14}" text-anchor="middle" font-size="9" fill="var(--o0)">${tickText(t)}</text>`).join('');
  const yLabels = yTicks.map(t => `<text x="${x0 - 8}" y="${yAt(t) + 3}" text-anchor="end" font-size="9" fill="var(--o0)">${tickText(t)}</text>`).join('');
  const marker = (opts.markerX != null ? `<line x1="${xAt(opts.markerX)}" y1="${y1}" x2="${xAt(opts.markerX)}" y2="${y0}" stroke="var(--s0)" stroke-dasharray="3 3"/>` : '')
    + (opts.markerY != null ? `<line x1="${x0}" y1="${yAt(opts.markerY)}" x2="${x1}" y2="${yAt(opts.markerY)}" stroke="var(--s0)" stroke-dasharray="3 3"/>` : '');
  const lines = series.map(s => `<polyline points="${s.pts.map(([x, y]) => `${xAt(x)},${yAt(Math.max(yMin, Math.min(yMax, y)))}`).join(' ')}" fill="none" stroke="${s.color || 'var(--mauve)'}" stroke-width="1.5"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}/>`).join('');
  const dots = (opts.dots || []).map(d => `<circle cx="${xAt(d.x)}" cy="${yAt(d.y)}" r="3" fill="${d.color || 'var(--peach)'}"/>${d.label ? `<text x="${xAt(d.x)}" y="${yAt(d.y) - 8}" text-anchor="middle" font-size="9" fill="${d.color || 'var(--peach)'}">${mdEsc(d.label)}</text>` : ''}`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}">
    ${grid}${marker}
    <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="var(--s1)"/><line x1="${x0}" y1="${y1}" x2="${x0}" y2="${y0}" stroke="var(--s1)"/>
    ${lines}${dots}
    ${xLabels}${yLabels}
    <text x="${(x0 + x1) / 2}" y="${h - 2}" text-anchor="middle" font-size="10" fill="var(--o1)">${mdEsc(opts.xLabel || 'x')}</text>
    <text x="12" y="${(y0 + y1) / 2}" text-anchor="middle" font-size="10" fill="var(--o1)" transform="rotate(-90 12 ${(y0 + y1) / 2})">${mdEsc(opts.yLabel || 'y')}</text>
  </svg>`;
}
// a labelled scatter plot: points is [{x,y,color,r}], opts.lines draws straight segments on top (fit lines, margins, axes of projection)
function scatterSVG(points, opts = {}) {
  const w = opts.w || 360, h = opts.h || 220, x0 = 36, x1 = w - 14, y0 = h - 28, y1 = 14;
  const { xMin, xMax, yMin, yMax } = opts;
  const xAt = x => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const yAt = y => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  const xN = opts.xTicksN || 4, yN = opts.yTicksN || 4;
  const xTicks = Array.from({ length: xN }, (_, i) => xMin + (xMax - xMin) * i / (xN - 1));
  const yTicks = Array.from({ length: yN }, (_, i) => yMin + (yMax - yMin) * i / (yN - 1));
  const grid = xTicks.map(t => `<line x1="${xAt(t)}" y1="${y1}" x2="${xAt(t)}" y2="${y0}" stroke="var(--s0)"/>`).join('')
    + yTicks.map(t => `<line x1="${x0}" y1="${yAt(t)}" x2="${x1}" y2="${yAt(t)}" stroke="var(--s0)"/>`).join('');
  const lines = (opts.lines || []).map(l => `<line x1="${xAt(l.x1)}" y1="${yAt(l.y1)}" x2="${xAt(l.x2)}" y2="${yAt(l.y2)}" stroke="${l.color || 'var(--peach)'}" stroke-width="${l.w || 1.5}"${l.dash ? ` stroke-dasharray="${l.dash}"` : ''}/>`).join('');
  const dots = points.map(p => `<circle cx="${xAt(p.x)}" cy="${yAt(p.y)}" r="${p.r || 4}" fill="${p.color || 'var(--mauve)'}"/>`).join('');
  const labels = (opts.xLabel || opts.yLabel) ? `<text x="${(x0 + x1) / 2}" y="${h - 2}" text-anchor="middle" font-size="10" fill="var(--o1)">${mdEsc(opts.xLabel || '')}</text>
    <text x="10" y="${(y0 + y1) / 2}" text-anchor="middle" font-size="10" fill="var(--o1)" transform="rotate(-90 10 ${(y0 + y1) / 2})">${mdEsc(opts.yLabel || '')}</text>` : '';
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}">
    ${grid}
    <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="var(--s1)"/><line x1="${x0}" y1="${y1}" x2="${x0}" y2="${y0}" stroke="var(--s1)"/>
    ${lines}${dots}${labels}
  </svg>`;
}

// ---- live widgets: a fenced block with the language "widget" and a name inside draws one of these
const widgets = {
  // one neuron: three inputs, a weight on each, a bias, and the weighted sum it produces
  perceptron(el) {
    el.innerHTML = `<p class="wgt">Try it: change a weight or the bias</p>
      <div class="wgrow"><label>w₁ <input id="w-w1" type="number" value="4" step="1"></label><label>w₂ <input id="w-w2" type="number" value="3" step="1"></label><label>w₃ <input id="w-w3" type="number" value="2" step="1"></label><label>bias <input id="w-b" type="number" value="1" step="1"></label></div>
      <div class="nndiag" id="w-nn"></div>
      <p class="wgo">z = w₁x₁ + w₂x₂ + w₃x₃ + bias = <b id="w-z"></b></p>`;
    const run = () => {
      const w1 = +$('#w-w1').value || 0, w2 = +$('#w-w2').value || 0, w3 = +$('#w-w3').value || 0, b = +$('#w-b').value || 0;
      const z = w1 + w2 + w3 + b; // x1 = x2 = x3 = 1: each input is simply "on"
      $('#w-z').textContent = z;
      $('#w-nn').innerHTML = `<svg viewBox="0 0 320 140" width="100%" height="140">
        <line x1="60" y1="30" x2="180" y2="70" stroke="var(--sub0)"/><line x1="60" y1="70" x2="180" y2="70" stroke="var(--sub0)"/><line x1="60" y1="110" x2="180" y2="70" stroke="var(--sub0)"/>
        <line x1="192" y1="70" x2="270" y2="70" stroke="var(--mauve)" stroke-width="1.5"/>
        <polygon points="270,70 260,65 260,75" fill="var(--mauve)"/>
        <circle cx="60" cy="30" r="14" fill="var(--base)" stroke="var(--sub0)"/><text x="60" y="34" text-anchor="middle" font-size="11" fill="var(--text)">x₁</text>
        <circle cx="60" cy="70" r="14" fill="var(--base)" stroke="var(--sub0)"/><text x="60" y="74" text-anchor="middle" font-size="11" fill="var(--text)">x₂</text>
        <circle cx="60" cy="110" r="14" fill="var(--base)" stroke="var(--sub0)"/><text x="60" y="114" text-anchor="middle" font-size="11" fill="var(--text)">x₃</text>
        <text x="118" y="22" text-anchor="middle" font-size="11" fill="var(--peach)">w₁=${w1}</text>
        <text x="118" y="64" text-anchor="middle" font-size="11" fill="var(--peach)">w₂=${w2}</text>
        <text x="118" y="106" text-anchor="middle" font-size="11" fill="var(--peach)">w₃=${w3}</text>
        <circle cx="180" cy="70" r="18" fill="var(--base)" stroke="var(--mauve)" stroke-width="1.5"/><text x="180" y="74" text-anchor="middle" font-size="12" fill="var(--mauve)">Σ</text>
        <text x="180" y="100" text-anchor="middle" font-size="10" fill="var(--o1)">bias=${b}</text>
        <text x="290" y="74" font-size="12" fill="var(--text)">z = ${z}</text>
      </svg>`;
    };
    el.addEventListener('input', run); run();
  },
  // the fixed input / hidden / hidden / output diagram
  mlpdiagram(el) {
    el.innerHTML = `<p class="wgt">A multi-layer perceptron</p><div class="nndiag">${nnSVG([3, 4, 4, 1], { labels: ['Input Layer', 'Hidden Layer', 'Hidden Layer', 'Output Layer'] })}</div>`;
  },
  // slider: how many hidden layers before it counts as "deep"
  dlvsml(el) {
    el.innerHTML = `<p class="wgt">Try it: add hidden layers</p>
      <div class="wgrow"><label>Hidden layers <input id="w-hl" type="range" min="1" max="4" value="1"></label><b id="w-hlv">1</b></div>
      <div class="nndiag" id="w-dl"></div><p class="wgo" id="w-dlsay"></p>`;
    const run = () => {
      const n = +$('#w-hl').value;
      $('#w-hlv').textContent = n;
      const counts = [3, ...Array(n).fill(4), 2];
      $('#w-dl').innerHTML = nnSVG(counts, { labels: ['Input', ...Array(n).fill('Hidden'), 'Output'] });
      $('#w-dlsay').innerHTML = n === 1 ? 'One hidden layer: a plain neural network.' : `${n} hidden layers: deep enough to call it <b>deep learning</b>.`;
    };
    el.addEventListener('input', run); run();
  },
  // step / sigmoid / softmax / tanh / ReLU, all fed the same three raw scores
  activationfunctions(el) {
    const raw = { Thailand: -2, Jamaica: 5, Dubai: 8 };
    const fns = {
      Step: x => x > 0 ? 1 : 0,
      Sigmoid: x => 1 / (1 + Math.exp(-x)),
      Softmax: null, // handled separately: needs every score at once
      tanh: x => Math.tanh(x),
      ReLU: x => Math.max(0, x),
    };
    el.innerHTML = `<p class="wgt">Try it: pick an activation function</p>
      <div class="wgrow" id="w-af-tabs"></div>
      <div class="nndiag" id="w-af-plot"></div>
      <div class="wgtable" id="w-af-rows"></div>`;
    $('#w-af-tabs').innerHTML = Object.keys(fns).map((n, i) => `<button type="button" class="seg2${i === 0 ? ' on' : ''}" data-f="${n}">${n}</button>`).join('');
    const plot = (f, yMin, yMax, name) => {
      const w = 360, h = 190, padL = 44, padR = 18, padT = 14, padB = 30;
      const x0 = padL, x1 = w - padR, y0 = h - padB, y1 = padT;
      const xAt = x => x0 + ((x + 8) / 16) * (x1 - x0);
      const yAt = y => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
      const pts = []; for (let px = 0; px <= x1 - x0; px += 4) { const x = (px / (x1 - x0)) * 16 - 8; pts.push(`${x0 + px},${yAt(f(x))}`); }
      const xTicks = [-8, -4, 0, 4, 8];
      const yTicks = yMax - yMin <= 1 ? [yMin, (yMin + yMax) / 2, yMax] : [yMin, yMin + (yMax - yMin) / 2, yMax];
      const grid = xTicks.map(t => `<line x1="${xAt(t)}" y1="${y1}" x2="${xAt(t)}" y2="${y0}" stroke="var(--s0)"/>`).join('')
        + yTicks.map(t => `<line x1="${x0}" y1="${yAt(t)}" x2="${x1}" y2="${yAt(t)}" stroke="var(--s0)"/>`).join('');
      const xLabels = xTicks.map(t => `<text x="${xAt(t)}" y="${y0 + 14}" text-anchor="middle" font-size="9" fill="var(--o0)">${t}</text>`).join('');
      const yLabels = yTicks.map(t => `<text x="${x0 - 8}" y="${yAt(t) + 3}" text-anchor="end" font-size="9" fill="var(--o0)">${t.toFixed(t % 1 ? 1 : 0)}</text>`).join('');
      const dots = Object.entries(raw).map(([k, v]) => `<circle cx="${xAt(v)}" cy="${yAt(f(v))}" r="3" fill="var(--peach)"/><text x="${xAt(v)}" y="${yAt(f(v)) - 8}" text-anchor="middle" font-size="9" fill="var(--peach)">${k}</text>`).join('');
      return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}">
        ${grid}
        <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="var(--s1)"/><line x1="${x0}" y1="${y1}" x2="${x0}" y2="${y0}" stroke="var(--s1)"/>
        <polyline points="${pts.join(' ')}" fill="none" stroke="var(--mauve)" stroke-width="1.5"/>
        ${dots}
        ${xLabels}${yLabels}
        <text x="${(x0 + x1) / 2}" y="${h - 2}" text-anchor="middle" font-size="10" fill="var(--o1)">raw score (x)</text>
        <text x="12" y="${(y0 + y1) / 2}" text-anchor="middle" font-size="10" fill="var(--o1)" transform="rotate(-90 12 ${(y0 + y1) / 2})">${name}(x)</text>
      </svg>`;
    };
    const paint = name => {
      $$('#w-af-tabs button').forEach(b => b.classList.toggle('on', b.dataset.f === name));
      if (name === 'Softmax') {
        const exps = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Math.exp(v)]));
        const sum = Object.values(exps).reduce((a, b) => a + b, 0);
        $('#w-af-plot').innerHTML = `<div class="wgbars">${Object.entries(raw).map(([k, v]) => `<div class="wgbar"><i style="height:${Math.max(2, (exps[k] / sum) * 100)}%"></i><b>${(exps[k] / sum * 100).toFixed(1)}%</b><span>${k}</span></div>`).join('')}</div>`;
        $('#w-af-rows').innerHTML = `<div><code>probabilities</code><span class="ok">add up to 1</span></div>`;
      } else {
        const f = fns[name];
        const ranges = { Step: [0, 1], Sigmoid: [0, 1], tanh: [-1, 1], ReLU: [0, 8] };
        $('#w-af-plot').innerHTML = plot(f, ...ranges[name], name);
        $('#w-af-rows').innerHTML = Object.entries(raw).map(([k, v]) => `<div><code>${k}: ${v}</code><span class="ok">${f(v).toFixed(name === 'ReLU' || name === 'Step' ? 0 : 3)}</span></div>`).join('');
      }
    };
    $('#w-af-tabs').onclick = e => { const b = e.target.closest('button'); if (b) paint(b.dataset.f); };
    paint('Step');
  },
  // a simulated MNIST training run: scrub the epoch and watch loss, sample guesses and neuron weights change
  mnisttrainingreplay(el) {
    const digits = [6, 2, 3, 7, 2, 2, 3, 4, 7, 6];
    const trainLoss = e => 2.4 * Math.exp(-e / 10) + 0.01;
    const valLoss = e => 0.08 + 0.35 * Math.exp(-e / 18) + Math.max(0, e - 50) * 0.0015;
    el.innerHTML = `<p class="wgt">Try it: scrub the epoch</p>
      <div class="mntabs" id="mn-tabs">
        <button type="button" class="seg2 on" data-v="bird">Bird's Eye</button>
        <button type="button" class="seg2" data-v="neuron">Neuron Level</button>
        <button type="button" class="seg2" data-v="math">Math Level</button>
      </div>
      <div class="wgrow"><label>Epoch <input id="mn-e" type="range" min="1" max="100" value="1"></label><b id="mn-ev">1</b></div>
      <div id="mn-view"></div>
      <p class="wgcap">A simulated training run, so you can scrub 100 epochs without a GPU. The shapes are what a real loss curve and weight grid look like, not an export of one.</p>`;
    const lossSVG = e => {
      const w = 420, h = 160, xAt = ep => 30 + (ep / 100) * 380, yAt = l => 140 - Math.min(l, 2.4) / 2.4 * 120;
      const tp = [], vp = [];
      for (let ep = 1; ep <= e; ep++) { tp.push(`${xAt(ep)},${yAt(trainLoss(ep))}`); vp.push(`${xAt(ep)},${yAt(valLoss(ep))}`); }
      return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}">
        <line x1="30" y1="140" x2="410" y2="140" stroke="var(--s1)"/><line x1="30" y1="20" x2="30" y2="140" stroke="var(--s1)"/>
        <line x1="${xAt(e)}" y1="20" x2="${xAt(e)}" y2="140" stroke="var(--s0)" stroke-dasharray="3 3"/>
        <polyline points="${tp.join(' ')}" fill="none" stroke="var(--peach)" stroke-width="1.5"/>
        <polyline points="${vp.join(' ')}" fill="none" stroke="var(--sub0)" stroke-width="1.5" stroke-dasharray="4 3"/>
        <text x="330" y="30" font-size="10" fill="var(--peach)">─ Train</text><text x="330" y="44" font-size="10" fill="var(--sub0)">- - Val</text>
        <text x="10" y="150" font-size="9" fill="var(--o0)">0</text><text x="200" y="155" font-size="9" fill="var(--o0)">epoch</text><text x="395" y="150" font-size="9" fill="var(--o0)">100</text>
      </svg>`;
    };
    const digitCanvas = (d) => { const c = document.createElement('canvas'); c.width = 56; c.height = 56;
      const ctx = c.getContext('2d'); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 56, 56);
      ctx.fillStyle = '#d8dbe8'; ctx.font = '700 36px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(d), 28, 30); return c; };
    const predict = (d, e, rnd) => {
      const confidence = Math.min(0.995, 0.3 + (e / 100) * 0.68 + rnd() * 0.04);
      const wrongChance = Math.max(0, 0.5 - e / 100 * 0.55);
      const guess = rnd() < wrongChance ? (d + 1 + Math.floor(rnd() * 8)) % 10 : d;
      return { guess, confidence: guess === d ? confidence : 0.3 + rnd() * 0.3 };
    };
    const weightCanvas = (seed, e) => { const c = document.createElement('canvas'); c.width = 48; c.height = 48;
      const ctx = c.getContext('2d'), n = 12, cell = 48 / n, rnd = seeded(seed), mix = e / 100;
      for (let yy = 0; yy < n; yy++) for (let xx = 0; xx < n; xx++) {
        const noise = rnd() * 2 - 1;
        const pattern = Math.sin((xx / n) * Math.PI * (1 + (seed % 3)) + seed) * Math.cos((yy / n) * Math.PI * (1 + (seed % 2)));
        const v = noise * (1 - mix) + pattern * mix;
        ctx.fillStyle = v > 0 ? `rgba(243,139,168,${Math.min(1, Math.abs(v))})` : `rgba(137,180,250,${Math.min(1, Math.abs(v))})`;
        ctx.fillRect(xx * cell, yy * cell, cell, cell);
      }
      return c; };
    const views = {
      bird(e) { return `<div class="mnloss">${lossSVG(e)}</div>
        <p class="wgcap">Train loss ${trainLoss(e).toFixed(3)} · Val loss ${valLoss(e).toFixed(3)}${e > 55 ? '. Val is creeping back up: the start of overfitting.' : ''}</p>`; },
      neuron(e) { const rnd = seeded(e * 97 + 1);
        const cells = digits.map(d => { const p = predict(d, e, rnd); return { d, ...p }; });
        return `<p class="wgt2">Sample predictions (epoch ${e})</p><div class="mnpreds" id="mn-preds"></div>
          <p class="wgt2">Layer 1 neuron weights (first 16 of 128)</p><div class="mnweights" id="mn-weights"></div>
          <p class="wgcap">Each square is one neuron's weights reshaped to a grid. Blue = negative, red = positive. Watch structure appear as the epoch rises.</p>
          <script id="mn-data" type="application/json">${JSON.stringify(cells)}</script>`; },
      math(e) { return `<div class="wgtable">
          <div><code>z = Σ wᵢxᵢ + b</code><span class="ok">weighted sum</span></div>
          <div><code>a = activation(z)</code><span class="ok">what the neuron passes on</span></div>
          <div><code>loss (epoch ${e})</code><span class="ok">train ${trainLoss(e).toFixed(3)}, val ${valLoss(e).toFixed(3)}</span></div>
          <div><code>w ← w − η·∂L/∂w</code><span class="ok">η is the learning rate</span></div>
        </div>`; },
    };
    let mode = 'bird';
    const paint = () => {
      const e = +$('#mn-e').value;
      $('#mn-ev').textContent = e;
      $('#mn-view').innerHTML = views[mode](e);
      if (mode === 'neuron') {
        const cells = JSON.parse($('#mn-data').textContent);
        $('#mn-preds').innerHTML = '';
        cells.forEach(({ d, guess, confidence }) => {
          const cell = document.createElement('div'); cell.className = 'mnpred';
          cell.append(digitCanvas(d));
          const lab = document.createElement('b'); lab.textContent = guess; lab.className = guess === d ? 'ok' : 'bad'; cell.append(lab);
          const pct = document.createElement('span'); pct.textContent = Math.round(confidence * 100) + '%'; cell.append(pct);
          $('#mn-preds').append(cell);
        });
        $('#mn-weights').innerHTML = '';
        for (let i = 0; i < 16; i++) $('#mn-weights').append(weightCanvas(i + 1, e));
      }
    };
    $('#mn-tabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#mn-tabs button').forEach(x => x.classList.toggle('on', x === b)); mode = b.dataset.v; paint(); };
    $('#mn-e').addEventListener('input', paint);
    paint();
  },
  // three nested rings: click one to read what it means
  aimldl(el) {
    const info = {
      AI: 'Any program that does something that looks intelligent, even a simple if/else chatbot.',
      ML: 'A program that gets better at a task from data, instead of being hand-coded rule by rule.',
      DL: 'Machine learning done with many-layered neural networks.',
    };
    let sel = 'AI';
    const ring = (k, r) => `<circle cx="150" cy="130" r="${r}" fill="none" stroke="${sel === k ? 'var(--mauve)' : 'var(--s1)'}" stroke-width="${sel === k ? 2 : 1.5}" data-k="${k}" style="cursor:pointer"/><text x="150" y="${130 - r - 10}" text-anchor="middle" data-k="${k}" style="cursor:pointer" font-size="13" font-weight="700" fill="${sel === k ? 'var(--mauve)' : 'var(--o1)'}">${k}</text>`;
    const paint = () => {
      $('#w-rings').innerHTML = `<svg viewBox="0 0 260 240" width="100%" height="240">${ring('AI', 90)}${ring('ML', 58)}${ring('DL', 28)}</svg>`;
      $('#w-ringsay').textContent = info[sel];
    };
    el.innerHTML = `<p class="wgt">Try it: click a ring</p><div class="nndiag" id="w-rings"></div><p class="wgo" id="w-ringsay"></p>`;
    paint();
    $('#w-rings').onclick = e => { const k = e.target.closest('[data-k]'); if (k) { sel = k.dataset.k; paint(); } };
  },
  // three loss curves: pick a learning rate and see smooth descent, a slow crawl, or overshoot
  learningrate(el) {
    const curves = {
      Good: t => 2 * Math.exp(-t / 10) + 0.05,
      'Too low': t => 2 * Math.exp(-t / 60) + 0.05,
      'Too high': t => 0.3 + 1.6 * Math.abs(Math.sin(t * 0.9)) * Math.exp(t * 0.045),
    };
    el.innerHTML = `<p class="wgt">Try it: pick a learning rate</p>
      <div class="wgrow" id="w-lr-tabs"></div>
      <div class="nndiag" id="w-lr-plot"></div>
      <p class="wgcap" id="w-lr-say"></p>`;
    $('#w-lr-tabs').innerHTML = Object.keys(curves).map((n, i) => `<button type="button" class="seg2${i === 0 ? ' on' : ''}" data-n="${n}">${n}</button>`).join('');
    const says = { Good: 'Just right: the loss falls smoothly and settles near its lowest point.', 'Too low': 'Too small a step: it is still falling after 40 steps, it would just take forever.', 'Too high': 'Too big a step: it overshoots the bottom and the loss gets worse, not better.' };
    const paint = name => {
      $$('#w-lr-tabs button').forEach(b => b.classList.toggle('on', b.dataset.n === name));
      const f = curves[name], pts = Array.from({ length: 81 }, (_, i) => [i / 2, f(i / 2)]);
      $('#w-lr-plot').innerHTML = curveSVG([{ pts, color: 'var(--mauve)' }], { xMin: 0, xMax: 40, yMin: 0, yMax: 3, xLabel: 'training step', yLabel: 'loss' });
      $('#w-lr-say').textContent = says[name];
    };
    $('#w-lr-tabs').onclick = e => { const b = e.target.closest('button'); if (b) paint(b.dataset.n); };
    paint('Good');
  },
  // a bar of boxes split into train / test by a slider
  traintestsplit(el) {
    const N = 20;
    el.innerHTML = `<p class="wgt">Try it: change the split</p>
      <div class="wgrow"><label>Train % <input id="w-tt" type="range" min="50" max="80" step="5" value="70"></label><b id="w-ttv">70%</b></div>
      <div class="wgrow"><label>Validation % <input id="w-tv" type="range" min="5" max="30" step="5" value="15"></label><b id="w-tvv">15%</b></div>
      <div class="ttbar" id="w-ttbar"></div>
      <p class="wgo" id="w-ttsay"></p>`;
    const run = () => {
      const trainPct = +$('#w-tt').value, valPct = +$('#w-tv').value;
      const testPct = Math.max(5, 100 - trainPct - valPct);
      $('#w-ttv').textContent = trainPct + '%'; $('#w-tvv').textContent = valPct + '%';
      const trainN = Math.round(N * trainPct / 100), valN = Math.round(N * valPct / 100), testN = N - trainN - valN;
      $('#w-ttbar').innerHTML = Array.from({ length: N }, (_, i) => `<i style="background:${i < trainN ? 'var(--blue)' : i < trainN + valN ? 'var(--green)' : 'var(--peach)'}"></i>`).join('');
      $('#w-ttsay').innerHTML = `<b>${trainN}</b> train it, <b>${valN}</b> validate it (tune settings, catch overfitting while training), and <b>${testN}</b> are held back completely for one final, honest check${testPct < 10 ? ', though that test set is getting small to trust' : ' on data it has never influenced at all'}.`;
    };
    $('#w-tt').addEventListener('input', run); $('#w-tv').addEventListener('input', run); run();
  },
  // train error always falls with complexity; validation error is U-shaped
  overfitcurve(el) {
    const trainErr = c => 3 / c + 0.05;
    const valErr = c => 0.08 + 0.09 * (c - 4) ** 2 + 0.15 / c;
    el.innerHTML = `<p class="wgt">Try it: change model complexity</p>
      <div class="wgrow"><label>Complexity <input id="w-oc" type="range" min="1" max="10" value="4"></label><b id="w-ocv">4</b></div>
      <div class="nndiag" id="w-ocplot"></div><p class="wgo" id="w-ocsay"></p>`;
    const run = () => {
      const c = +$('#w-oc').value; $('#w-ocv').textContent = c;
      const tp = [], vp = []; for (let x = 1; x <= 10; x += 0.5) { tp.push([x, trainErr(x)]); vp.push([x, valErr(x)]); }
      $('#w-ocplot').innerHTML = curveSVG(
        [{ pts: tp, color: 'var(--peach)' }, { pts: vp, color: 'var(--sub0)', dash: '4 3' }],
        { xMin: 1, xMax: 10, yMin: 0, yMax: 2, xLabel: 'model complexity', yLabel: 'error', markerX: c, dots: [{ x: c, y: trainErr(c), color: 'var(--peach)' }, { x: c, y: valErr(c), color: 'var(--sub0)' }] }
      );
      const regime = c <= 2 ? 'underfitting: too simple to capture the pattern' : c >= 7 ? 'overfitting: fitting the training noise, not the pattern' : 'a good fit: low error on both train and validation';
      $('#w-ocsay').innerHTML = `Train error ${trainErr(c).toFixed(2)}, validation error ${valErr(c).toFixed(2)}: ${regime}.`;
    };
    el.addEventListener('input', run); run();
  },
  // an editable 2x2 confusion matrix with live accuracy / precision / recall / F1
  confusionmatrix(el) {
    el.innerHTML = `<p class="wgt">Try it: change the counts</p>
      <div class="cmgrid">
        <div></div><b>Predicted +</b><b>Predicted −</b>
        <b>Actual +</b><input id="w-tp" type="number" value="42" min="0"><input id="w-fn" type="number" value="8" min="0">
        <b>Actual −</b><input id="w-fp" type="number" value="5" min="0"><input id="w-tn" type="number" value="45" min="0">
      </div>
      <div class="wgtable" id="w-cmrows"></div>`;
    const run = () => {
      const tp = +$('#w-tp').value || 0, fn = +$('#w-fn').value || 0, fp = +$('#w-fp').value || 0, tn = +$('#w-tn').value || 0;
      const total = tp + fn + fp + tn || 1;
      const acc = (tp + tn) / total, prec = tp / (tp + fp || 1), rec = tp / (tp + fn || 1), f1 = (prec + rec) ? 2 * prec * rec / (prec + rec) : 0;
      const row = (label, val) => `<div><code>${label}</code><span class="ok">${(val * 100).toFixed(1)}%</span></div>`;
      $('#w-cmrows').innerHTML = row('accuracy = (TP+TN) / total', acc) + row('precision = TP / (TP+FP)', prec) + row('recall = TP / (TP+FN)', rec) + row('F1 = 2·precision·recall / (precision+recall)', f1);
    };
    el.addEventListener('input', run); run();
  },
  // a scatter of noisy points with a slope/intercept line you control, and the sum of squared error it produces
  linregfit(el) {
    const rnd = seeded(7);
    const pts = Array.from({ length: 12 }, (_, i) => { const x = i + 1; return { x, y: 2 * x + 3 + (rnd() * 2 - 1) * 3 }; });
    el.innerHTML = `<p class="wgt">Try it: fit the line</p>
      <div class="wgrow"><label>slope (m) <input id="w-m" type="range" min="-1" max="5" step="0.1" value="1"></label><label>intercept (b) <input id="w-b2" type="range" min="-10" max="20" step="1" value="0"></label></div>
      <div class="nndiag" id="w-lr"></div><p class="wgo">Sum of squared error = <b id="w-sse"></b></p>`;
    const run = () => {
      const m = +$('#w-m').value, b = +$('#w-b2').value;
      const xMin = 0, xMax = 13, yMin = -5, yMax = 35;
      const sse = pts.reduce((s, p) => s + (p.y - (m * p.x + b)) ** 2, 0);
      $('#w-sse').innerHTML = sse.toFixed(1);
      const residuals = pts.map(p => ({ x1: p.x, y1: p.y, x2: p.x, y2: m * p.x + b, color: 'var(--s1)', w: 1, dash: '2 2' }));
      $('#w-lr').innerHTML = scatterSVG(pts, { xMin, xMax, yMin, yMax, xLabel: 'x', yLabel: 'y', lines: [{ x1: xMin, y1: m * xMin + b, x2: xMax, y2: m * xMax + b, color: 'var(--mauve)' }, ...residuals] });
    };
    el.addEventListener('input', run); run();
  },
  // the sigmoid curve with a movable decision threshold
  logregboundary(el) {
    const examples = [-6, -3, -1, 1, 2, 4, 6, 7];
    const sig = x => 1 / (1 + Math.exp(-x));
    el.innerHTML = `<p class="wgt">Try it: move the decision threshold</p>
      <div class="wgrow"><label>Threshold <input id="w-th" type="range" min="0.1" max="0.9" step="0.05" value="0.5"></label><b id="w-thv">0.50</b></div>
      <div class="nndiag" id="w-lg"></div><div class="wgtable" id="w-lgrows"></div>`;
    const run = () => {
      const th = +$('#w-th').value; $('#w-thv').textContent = th.toFixed(2);
      const pts = Array.from({ length: 61 }, (_, i) => { const x = (i / 60) * 16 - 8; return [x, sig(x)]; });
      const dots = examples.map(x => ({ x, y: sig(x), color: sig(x) >= th ? 'var(--green)' : 'var(--red)' }));
      $('#w-lg').innerHTML = curveSVG([{ pts, color: 'var(--mauve)' }], { xMin: -8, xMax: 8, yMin: 0, yMax: 1, xLabel: 'score', yLabel: 'probability', markerY: th, dots });
      $('#w-lgrows').innerHTML = examples.map(x => { const p = sig(x), cls = p >= th ? 'pass' : 'fail'; return `<div><code>score ${x} → p=${p.toFixed(2)}</code><span class="${cls === 'pass' ? 'ok' : 'bad'}">${cls}</span></div>`; }).join('');
    };
    el.addEventListener('input', run); run();
  },
  // two seeded clusters with a separating line and a margin you can widen
  // ponytail: boundary is a fixed vertical line, not a solved SVM optimum, fine for the "widen the margin" idea, swap for a real max-margin solve if this ever needs to react to a different dataset
  svmmargin(el) {
    const rnd = seeded(21);
    const cls1 = Array.from({ length: 8 }, () => ({ x: 2 + rnd() * 3, y: 2 + rnd() * 5, color: 'var(--sky)' }));
    const cls2 = Array.from({ length: 8 }, () => ({ x: 7 + rnd() * 3, y: 2 + rnd() * 5, color: 'var(--peach)' }));
    el.innerHTML = `<p class="wgt">Try it: widen the margin</p>
      <div class="wgrow"><label>Margin <input id="w-mg" type="range" min="0" max="2" step="0.1" value="0.8"></label></div>
      <div class="nndiag" id="w-svm"></div>
      <p class="wgcap">The dashed lines are the margin. The points sitting right on its edge are the support vectors: the only points that decide where the line goes.</p>`;
    const run = () => {
      const m = +$('#w-mg').value, boundary = 6.25;
      const lines = [
        { x1: boundary, y1: 0, x2: boundary, y2: 9, color: 'var(--mauve)' },
        { x1: boundary - m, y1: 0, x2: boundary - m, y2: 9, color: 'var(--s1)', w: 1, dash: '4 3' },
        { x1: boundary + m, y1: 0, x2: boundary + m, y2: 9, color: 'var(--s1)', w: 1, dash: '4 3' },
      ];
      $('#w-svm').innerHTML = scatterSVG([...cls1, ...cls2], { xMin: 0, xMax: 13, yMin: 0, yMax: 9, xLabel: 'feature 1', yLabel: 'feature 2', lines });
    };
    el.addEventListener('input', run); run();
  },
  // a static, clean two-split decision tree
  decisiontree(el) {
    const node = (x, y, w, h, label, leaf) => `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="8" fill="${leaf ? 'color-mix(in srgb, var(--mauve) 18%, var(--base))' : 'var(--base)'}" stroke="${leaf ? 'var(--mauve)' : 'var(--sub0)'}" stroke-width="1.5"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10.5" fill="var(--text)">${label}</text>`;
    const edge = (x1, y1, x2, y2, label) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--s1)"/>${label ? `<text x="${(x1 + x2) / 2 + 10}" y="${(y1 + y2) / 2}" text-anchor="middle" font-size="9" fill="var(--o0)">${label}</text>` : ''}`;
    const svg = `<svg viewBox="0 0 360 230" width="100%" height="230">
      ${edge(180, 38, 95, 88, 'yes')}${edge(180, 38, 265, 88, 'no')}
      ${edge(95, 106, 55, 160, 'yes')}${edge(95, 106, 135, 160, 'no')}
      ${node(180, 20, 150, 36, 'Age &lt; 30?')}
      ${node(95, 95, 140, 36, 'Income &lt; 50k?')}
      ${node(265, 95, 110, 36, 'Buys SUV', true)}
      ${node(55, 170, 100, 36, 'Buys hatchback', true)}
      ${node(135, 170, 100, 36, 'Buys sedan', true)}
    </svg>`;
    el.innerHTML = `<p class="wgt">A decision tree, one split at a time</p><div class="nndiag">${svg}</div><p class="wgcap">Every box is a yes/no question about one feature. Follow the arrows from the root to a leaf, and the leaf is the prediction.</p>`;
  },
  // real k-means over a seeded dataset: step through the iterations
  kmeanscluster(el) {
    const rnd = seeded(33);
    const pts = Array.from({ length: 18 }, () => ({ x: rnd() * 12, y: rnd() * 9 }));
    const K = 3, colors = ['var(--sky)', 'var(--peach)', 'var(--green)'];
    let centroids = Array.from({ length: K }, (_, i) => ({ x: 2 + i * 4, y: 4 + (i % 2) * 3 }));
    const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    const snapshots = [];
    for (let iter = 0; iter < 5; iter++) {
      const assign = pts.map(p => { let bi = 0, bd = Infinity; centroids.forEach((c, i) => { const d = dist2(p, c); if (d < bd) { bd = d; bi = i; } }); return bi; });
      snapshots.push({ centroids: centroids.map(c => ({ ...c })), assign });
      centroids = centroids.map((c, i) => { const members = pts.filter((_, j) => assign[j] === i); return members.length ? { x: members.reduce((s, p) => s + p.x, 0) / members.length, y: members.reduce((s, p) => s + p.y, 0) / members.length } : c; });
    }
    el.innerHTML = `<p class="wgt">Try it: step through k-means</p>
      <div class="wgrow"><label>Iteration <input id="w-km" type="range" min="0" max="${snapshots.length - 1}" value="0"></label><b id="w-kmv">0</b></div>
      <div class="nndiag" id="w-kmplot"></div><p class="wgcap" id="w-kmsay"></p>`;
    const run = () => {
      const it = +$('#w-km').value; $('#w-kmv').textContent = it;
      const snap = snapshots[it];
      const dots = pts.map((p, i) => ({ x: p.x, y: p.y, color: colors[snap.assign[i]] }));
      const cdots = snap.centroids.map((c, i) => ({ x: c.x, y: c.y, color: colors[i], r: 7 }));
      $('#w-kmplot').innerHTML = scatterSVG([...dots, ...cdots], { xMin: -1, xMax: 13, yMin: -1, yMax: 10, xLabel: 'feature 1', yLabel: 'feature 2' });
      $('#w-kmsay').textContent = it === 0 ? 'Iteration 0: the centroids start in roughly fixed spots, before any grouping happens.' : `Iteration ${it}: every point joined its nearest centroid (its color), then each centroid moved to the average of its group.`;
    };
    el.addEventListener('input', run); run();
  },
  // real 2x2 PCA on seeded correlated data: the first principal axis and its share of the variance
  pcavariance(el) {
    const rnd = seeded(44);
    const pts = Array.from({ length: 30 }, () => { const x = rnd() * 10; return { x, y: 0.75 * x + (rnd() * 2 - 1) * 1.8 + 1 }; });
    const n = pts.length, mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n;
    let a = 0, b = 0, d = 0;
    pts.forEach(p => { const dx = p.x - mx, dy = p.y - my; a += dx * dx; b += dx * dy; d += dy * dy; });
    a /= n; b /= n; d /= n;
    const tr = a + d, det = a * d - b * b, disc = Math.sqrt(Math.max(0, (tr / 2) ** 2 - det));
    const l1 = tr / 2 + disc, l2 = Math.max(0, tr / 2 - disc);
    const angle = Math.atan2(l1 - a, b || 1e-9), len = 6;
    const line = { x1: mx - Math.cos(angle) * len, y1: my - Math.sin(angle) * len, x2: mx + Math.cos(angle) * len, y2: my + Math.sin(angle) * len, color: 'var(--mauve)' };
    const p1 = (l1 / (l1 + l2) * 100).toFixed(1), p2 = (l2 / (l1 + l2) * 100).toFixed(1);
    el.innerHTML = `<p class="wgt">The first principal component</p>
      <div class="nndiag" id="w-pca"></div>
      <p class="wgt2">Variance explained</p>
      <div class="wgbars"><div class="wgbar"><i style="height:${p1}%"></i><b>${p1}%</b><span>PC1</span></div><div class="wgbar"><i style="height:${p2}%"></i><b>${p2}%</b><span>PC2</span></div></div>
      <p class="wgcap">PC1 is the one straight line through the data that keeps the most spread. Projecting every point onto just that line throws away the least information.</p>`;
    $('#w-pca').innerHTML = scatterSVG(pts, { xMin: -1, xMax: 11, yMin: -2, yMax: 10, xLabel: 'feature 1', yLabel: 'feature 2', lines: [line] });
  },
  // a strip of K folds: pick which one is held out for testing
  crossvalfolds(el) {
    const K = 5;
    el.innerHTML = `<p class="wgt">Try it: pick the held-out fold</p>
      <div class="wgrow"><label>Fold <input id="w-cv" type="range" min="0" max="${K - 1}" value="0"></label><b id="w-cvv">1</b></div>
      <div class="foldbar" id="w-cvbar"></div>
      <p class="wgo" id="w-cvsay"></p>`;
    const run = () => {
      const held = +$('#w-cv').value; $('#w-cvv').textContent = held + 1;
      $('#w-cvbar').innerHTML = Array.from({ length: K }, (_, i) => `<i style="background:${i === held ? 'var(--peach)' : 'var(--blue)'}">${i + 1}</i>`).join('');
      const trainFolds = Array.from({ length: K }, (_, i) => i + 1).filter(n => n !== held + 1).join(', ');
      $('#w-cvsay').innerHTML = `Train on folds ${trainFolds}, test on fold <b>${held + 1}</b>. Repeat once per fold, then average the ${K} scores.`;
    };
    el.addEventListener('input', run); run();
  },
  // a small network diagram plus a button that steps through what each layer does
  forwardpass(el) {
    const steps = [
      'Input layer: 3 raw numbers go in, untouched.',
      'Hidden layer: every hidden neuron multiplies, adds, and decides, turning 3 numbers into 4 new ones.',
      'Output layer: those 4 numbers get combined one more time into the final 2 answers.',
    ];
    let i = 0;
    el.innerHTML = `<p class="wgt">A small network, step by step</p>
      <div class="nndiag">${nnSVG([3, 4, 2], { labels: ['Input', 'Hidden', 'Output'] })}</div>
      <div class="wgrow"><button class="btn ghost" id="w-fp" type="button">Step forward →</button></div>
      <p class="wgo" id="w-fpsay">${steps[0]}</p>`;
    $('#w-fp').onclick = () => { i = (i + 1) % steps.length; $('#w-fpsay').textContent = steps[i]; };
  },
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
