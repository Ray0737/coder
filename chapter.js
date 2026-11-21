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
// the label (icon + text) inside a widget's Play/Pause button, shared so every animated widget looks the same
const playLabel = playing => playing ? '<span class="ply">&#10074;&#10074;</span> Pause' : '<span class="ply">&#9654;</span> Play';

// animated widgets (Play/Step buttons) register their setInterval here, so leaving the chapter before it finishes can't leave an orphaned timer still poking a widget of the same name on a later visit
let activeTimers = [];
const trackTimer = id => { activeTimers.push(id); return id; };

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
        $('#w-af-rows').innerHTML = `<div class="afrow">${Object.entries(raw).map(([k, v]) => `<div><span>${k}</span><small>score ${v}</small><b>${(exps[k] / sum * 100).toFixed(1)}%</b></div>`).join('')}<div><span>Total</span><small>probabilities</small><b>100%</b></div></div>`;
      } else {
        const f = fns[name];
        const ranges = { Step: [0, 1], Sigmoid: [0, 1], tanh: [-1, 1], ReLU: [0, 8] };
        $('#w-af-plot').innerHTML = plot(f, ...ranges[name], name);
        $('#w-af-rows').innerHTML = `<div class="afrow">${Object.entries(raw).map(([k, v]) => `<div><span>${k}</span><small>score ${v}</small><b>${f(v).toFixed(name === 'ReLU' || name === 'Step' ? 0 : 3)}</b></div>`).join('')}</div>`;
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
      <div class="tb"><label>Train % <input id="w-tt" type="range" min="50" max="80" step="5" value="70"></label><b id="w-ttv">70%</b><label>Validation % <input id="w-tv" type="range" min="5" max="30" step="5" value="15"></label><b id="w-tvv">15%</b></div>
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
    const cell = (cls, label, sub, id, val) => `<div class="cmcell ${cls}"><i>${label}</i><input id="${id}" type="number" value="${val}" min="0"><span>${sub}</span></div>`;
    el.innerHTML = `<p class="wgt">Try it: change the counts</p>
      <div class="cmgrid">
        <div></div><b>Predicted +</b><b>Predicted −</b>
        <b>Actual +</b>${cell('ok', 'TP', 'Correctly caught', 'w-tp', 42)}${cell('bad', 'FN', 'Missed', 'w-fn', 8)}
        <b>Actual −</b>${cell('bad', 'FP', 'False alarm', 'w-fp', 5)}${cell('ok', 'TN', 'Correctly ignored', 'w-tn', 45)}
      </div>
      <div class="wgtable h" id="w-cmrows"></div>`;
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
      <div class="tb"><label>Threshold <input id="w-th" type="range" min="0.1" max="0.9" step="0.05" value="0.5"></label><b id="w-thv">0.50</b></div>
      <div class="nndiag" id="w-lg"></div><div class="wgtable h" id="w-lgrows"></div>`;
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
      <div class="tb"><label>Margin <input id="w-mg" type="range" min="0" max="2" step="0.1" value="0.8"></label></div>
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
    // plain on purpose: text for the questions, coloured text for the answers, thin lines between them
    const q = (x, y, s) => `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="13" fill="var(--text)">${s}</text>`;
    const leaf = (x, y, s) => `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="13" fill="var(--mauve)">${s}</text>`;
    const edge = (x1, y1, x2, y2, label) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--s1)"/><text x="${(x1 + x2) / 2 + (x2 < x1 ? -12 : 12)}" y="${(y1 + y2) / 2 + 3}" text-anchor="middle" font-size="10" fill="var(--o0)">${label}</text>`;
    el.innerHTML = `<p class="wgt">A decision tree, one split at a time</p>
      <svg viewBox="0 0 380 200" width="100%" height="200" style="max-width:420px;display:block;margin:6px auto">
        ${edge(190, 30, 110, 76, 'yes')}${edge(190, 30, 300, 76, 'no')}${edge(110, 106, 60, 152, 'yes')}${edge(110, 106, 165, 152, 'no')}
        ${q(190, 18, 'Age &lt; 30?')}${q(110, 94, 'Income &lt; 50k?')}${leaf(300, 94, 'SUV')}${leaf(60, 170, 'Hatchback')}${leaf(165, 170, 'Sedan')}
      </svg>
      <p class="wgcap">Every box is a yes/no question about one feature. Follow the arrows from the root to a leaf, and the leaf is the prediction.</p>`;
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
    const rows = Array.from({ length: K }, (_, r) => `<div class="cvfoldrow">${Array.from({ length: K }, (_, c) => c === r ? '<i class="test">Test</i>' : '<i class="train">Train</i>').join('')}</div>`).join('');
    const labels = Array.from({ length: K }, (_, i) => `<span>Fold ${i + 1}</span>`).join('');
    el.innerHTML = `<p class="wgt">Cross validation: K splits, averaged</p>
      <div class="cvfold">${rows}</div>
      <div class="cvfoldlabels">${labels}</div>
      <p class="wgcap">Each fold takes a turn being the test set. Final score = average of all ${K} folds. K=5 is the most common choice.</p>`;
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
      <div class="tb"><button class="bt act" id="w-fp" type="button">Step forward</button><button class="bt" id="w-fpr" type="button">Reset</button></div>
      <p class="wgo" id="w-fpsay">${steps[0]}</p>`;
    $('#w-fp').onclick = () => { i = (i + 1) % steps.length; $('#w-fpsay').textContent = steps[i]; };
    $('#w-fpr').onclick = () => { i = 0; $('#w-fpsay').textContent = steps[0]; };
  },
  // CNN training replay: a real recorded run (assets/data/cnn-train.json) of a 1-conv-layer net on 8x8 digits; scrub epochs, pick a digit
  cnnpipeline(el) {
    el.innerHTML = `<p class="wgt">Try it: watch a small CNN learn</p><p class="wgcap">Loading the recorded run…</p>`;
    fetch('assets/data/cnn-train.json').then(r => r.json()).then(D => {
      const E = D.epochs.length - 1, q = s => el.querySelector(s);
      let dg = 3, ep = 0, timer = null;
      const lum = v => `color-mix(in srgb, var(--text) ${Math.round(Math.max(0, Math.min(1, v)) * 100)}%, var(--crust))`;
      const sgn = (v, m) => v === 0 ? 'var(--base)' : `color-mix(in srgb, var(${v > 0 ? '--red' : '--blue'}) ${Math.min(100, Math.round(Math.abs(v) / m * 100))}%, var(--base))`;
      const grid = (vals, n, px, bg) => `<div class="pg" style="grid-template-columns:repeat(${n},${px}px);--s:${px}px">${vals.map(v => `<i style="background:${bg(v)}"></i>`).join('')}</div>`;
      const pool = m => { const o = []; for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) o.push(Math.max(m[2 * y * 6 + 2 * x], m[2 * y * 6 + 2 * x + 1], m[(2 * y + 1) * 6 + 2 * x], m[(2 * y + 1) * 6 + 2 * x + 1])); return o; };
      const plot = (series, ymax, title) => {
        const w = 260, h = 100, xs = i => 28 + i / E * (w - 40), ys = v => h - 18 - Math.min(v, ymax) / ymax * (h - 30);
        const line = (a, c, dash) => `<polyline points="${a.map((v, i) => xs(i) + ',' + ys(v)).join(' ')}" fill="none" stroke="var(--${c})" stroke-width="1.5"${dash ? ' stroke-dasharray="4 3"' : ''}/>`;
        const dots = title === 'Loss' ? D.iter_loss.map((b, i) => b.map((v, j) => `<circle cx="${xs(i + j / b.length)}" cy="${ys(v)}" r="1" fill="var(--o0)" opacity=".5"/>`).join('')).join('') : '';
        return `<svg viewBox="0 0 ${w} ${h}"><line x1="28" y1="${h - 18}" x2="${w - 12}" y2="${h - 18}" stroke="var(--s1)"/><line x1="28" y1="12" x2="28" y2="${h - 18}" stroke="var(--s1)"/>
          ${dots}${line(series[0], 'peach')}${line(series[1], 'sub0', 1)}
          <line x1="${xs(ep)}" y1="12" x2="${xs(ep)}" y2="${h - 18}" stroke="var(--mauve)" stroke-dasharray="3 3"/>
          <text x="30" y="9" font-size="9" fill="var(--o1)">${title} (solid = train, dashed = test)</text>
          <text x="22" y="${h - 15}" font-size="8" fill="var(--o0)" text-anchor="end">0</text><text x="22" y="18" font-size="8" fill="var(--o0)" text-anchor="end">${ymax}</text>
          <text x="${w - 12}" y="${h - 5}" font-size="8" fill="var(--o0)" text-anchor="end">epoch ${E}</text></svg>`;
      };
      el.innerHTML = `<p class="wgt">Try it: watch a small CNN learn</p>
        <div class="tb"><span>Digit</span><span class="opts" id="cp-dg">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button type="button" data-d="${d}" class="bt${d === dg ? ' on' : ''}">${d}</button>`).join('')}</span><span class="sp"></span>
          <button class="bt act" id="cp-play" type="button">Play</button><button class="bt" id="cp-step" type="button">Step</button><button class="bt" id="cp-reset" type="button">Reset</button></div>
        <div class="tb ro"><label>Epoch <input id="cp-e" type="range" min="0" max="${E}" value="0"></label><span id="cp-ro"></span></div>
        <div class="stg" id="cp-stg"></div><div class="plots" id="cp-plots"></div><p class="wgcap" id="cp-say"></p>
        <p class="wgcap">A real run, recorded once and replayed: ${D.model}, ${D.data}, plain SGD at learning rate ${D.lr}, batch ${D.batch}. Each dot on the loss plot is one batch (one iteration).</p>`;
      const draw = () => {
        const e = D.epochs[ep], probs = e.probs[dg], maps = e.maps[dg], top = probs.indexOf(Math.max(...probs));
        const fm = Math.max(0.01, ...e.filters.flat().map(Math.abs)), mm = Math.max(0.01, ...maps.flat());
        q('#cp-stg').innerHTML = `
          <div class="col"><p class="wgt2">Input (8×8)</p>${grid(D.samples[dg], 8, 12, lum)}</div>
          <div class="col"><p class="wgt2">4 filters (3×3)</p><div class="stack">${e.filters.map(f => grid(f, 3, 14, v => sgn(v, fm))).join('')}</div></div>
          <div class="col"><p class="wgt2">Feature maps (6×6)</p><div class="stack">${maps.map(m => grid(m, 6, 9, v => lum(v / mm))).join('')}</div></div>
          <div class="col"><p class="wgt2">After pooling (3×3)</p><div class="stack">${maps.map(m => grid(pool(m), 3, 18, v => lum(v / mm))).join('')}</div></div>
          <div class="col"><p class="wgt2">What it thinks</p>${probs.map((p, i) => `<div class="pb${i === top ? ' top' : ''}${i === top && top === dg ? ' ok' : ''}"><span>${i}</span><u><s style="width:${Math.round(p * 100)}%"></s></u><span>${Math.round(p * 100)}%</span></div>`).join('')}</div>`;
        q('#cp-plots').innerHTML = plot([D.epochs.map(x => x.loss), D.epochs.map(x => x.vloss)], 2.5, 'Loss') + plot([D.epochs.map(x => x.acc), D.epochs.map(x => x.vacc)], 1, 'Accuracy');
        q('#cp-e').value = ep;
        q('#cp-ro').innerHTML = `Epoch <b>${ep} / ${E}</b> · Loss <b>${e.loss.toFixed(2)}</b> <span>(test ${e.vloss.toFixed(2)})</span> · Accuracy <b>${Math.round(e.acc * 100)}%</b> <span>(test ${Math.round(e.vacc * 100)}%)</span>`;
        q('#cp-say').textContent = ep === 0 ? `Before any training the filters are random noise and it is guessing: its top pick for this ${dg} is "${top}" at ${Math.round(probs[top] * 100)}%.`
          : `After ${ep} epoch${ep > 1 ? 's' : ''} (${ep * D.iter_loss[0].length} iterations) it says "${top}" at ${Math.round(probs[top] * 100)}% for this ${dg}${top === dg ? ', which is right.' : ', which is wrong.'}`;
      };
      const stop = () => { if (timer) { clearInterval(timer); timer = null; } q('#cp-play').textContent = 'Play'; };
      const go = n => { ep = Math.max(0, Math.min(E, n)); draw(); };
      q('#cp-dg').onclick = ev => { const b = ev.target.closest('button'); if (!b) return; dg = +b.dataset.d; el.querySelectorAll('#cp-dg button').forEach(x => x.classList.toggle('on', x === b)); draw(); };
      q('#cp-e').oninput = ev => { stop(); go(+ev.target.value); };
      q('#cp-step').onclick = () => { stop(); go(ep + 1); };
      q('#cp-reset').onclick = () => { stop(); go(0); };
      q('#cp-play').onclick = () => {
        if (timer) return stop();
        if (ep >= E) go(0);
        q('#cp-play').textContent = 'Pause';
        timer = trackTimer(setInterval(() => { if (ep >= E) return stop(); go(ep + 1); }, 450));
      };
      draw();
    }).catch(() => { el.innerHTML = `<p class="wgt">Try it: watch a small CNN learn</p><p class="wgcap">Could not load the recorded run. Open the site over http, not as a plain file.</p>`; });
  },
  // max pooling by hand: a pool window hops over a 6x6 map and keeps only the biggest number in each patch
  maxpoolanim(el) {
    const rnd = seeded(11), N = 6, M = Array.from({ length: N * N }, () => 1 + Math.floor(rnd() * 9));
    const q = s => el.querySelector(s);
    let size = 2, stride = 2, pos = 0, timer = null;
    el.innerHTML = `<p class="wgt">Try it: pool a feature map</p>
      <div class="tb"><span>Pool size</span><span class="opts" id="mp-size"><button type="button" class="bt on" data-v="2">2×2</button><button type="button" class="bt" data-v="3">3×3</button></span><span class="sp"></span>
        <button class="bt act" id="mp-play" type="button">Play</button><button class="bt" id="mp-step" type="button">Step</button><button class="bt" id="mp-reset" type="button">Reset</button></div>
      <div class="tb ro"><span>Stride</span><span class="opts" id="mp-stride"><button type="button" class="bt" data-v="1">1</button><button type="button" class="bt on" data-v="2">2</button></span><span id="mp-ro"></span></div>
      <div class="mpwrap"><div class="col"><p class="wgt2">Input (6×6)</p><div id="mp-in"></div></div><div class="mparrow"><span>→</span><small id="mp-op"></small></div><div class="col"><p class="wgt2" id="mp-oh"></p><div id="mp-out"></div></div></div>
      <p class="wgcap" id="mp-say"></p>`;
    const out = () => Math.floor((N - size) / stride) + 1;
    const win = p => { const o = out(), y = Math.floor(p / o) * stride, x = (p % o) * stride, idx = []; for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) idx.push((y + dy) * N + x + dx); return idx; };
    const best = p => win(p).reduce((a, b) => M[b] > M[a] ? b : a);
    const draw = () => {
      const o = out(), total = o * o, at = Math.max(0, Math.min(pos, total) - 1), w = new Set(win(at)), mx = pos ? best(at) : -1;
      q('#mp-in').innerHTML = `<div class="cvgrid mpg" style="grid-template-columns:repeat(${N},34px)">${M.map((v, i) => `<div class="cvcell${i === mx ? ' mx' : w.has(i) && pos < total + 1 ? ' hit' : ''}">${v}</div>`).join('')}</div>`;
      q('#mp-out').innerHTML = `<div class="cvgrid mpg" style="grid-template-columns:repeat(${o},34px)">${Array.from({ length: total }, (_, p) => `<div class="cvcell${p < pos ? ' got' : ' empty'}">${p < pos ? M[best(p)] : ''}</div>`).join('')}</div>`;
      q('#mp-oh').textContent = `Output (${o}×${o})`;
      q('#mp-op').textContent = `max ${size}×${size}`;
      q('#mp-ro').innerHTML = `Output = (6 − ${size}) / ${stride} + 1 = <b>${o}×${o}</b>`;
      q('#mp-say').textContent = pos === 0 ? 'Press Step to pool the first window.' : pos >= total ? `Done: 36 numbers shrank to ${total}. Only the strongest response in each patch survived.` : `Window ${pos} of ${total}: the biggest number is ${M[mx]}, so that is what goes to the output.`;
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } q('#mp-play').textContent = 'Play'; };
    const pick = (id, set) => q(id).onclick = e => { const b = e.target.closest('button'); if (!b) return; set(+b.dataset.v); el.querySelectorAll(id + ' button').forEach(x => x.classList.toggle('on', x === b)); stop(); pos = 0; draw(); };
    pick('#mp-size', v => size = v);
    pick('#mp-stride', v => stride = v);
    q('#mp-step').onclick = () => { stop(); if (pos < out() ** 2) pos++; draw(); };
    q('#mp-reset').onclick = () => { stop(); pos = 0; draw(); };
    q('#mp-play').onclick = () => {
      if (timer) return stop();
      if (pos >= out() ** 2) pos = 0;
      q('#mp-play').textContent = 'Pause';
      timer = trackTimer(setInterval(() => { if (pos >= out() ** 2) return stop(); pos++; draw(); }, 600));
    };
    draw();
  },
  // the centerpiece: an animated sliding-kernel convolution over a fixed 9x9 input, with presets, stride and padding
  convanim(el) {
    const N = 9, k = 3;
    const presets = {
      'Vertical edge': { k: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], norm: 1 },
      'Horizontal edge': { k: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], norm: 1 },
      Blur: { k: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], norm: 1 / 9 },
      Sharpen: { k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], norm: 1 },
    };
    const rnd = seeded(5);
    const input = Array.from({ length: N }, () => Array(N).fill(0));
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) input[y][x] = Math.max(0, Math.min(1, (x < 4 ? 0.22 : 0.82) + (rnd() * 2 - 1) * 0.06));
    let presetName = 'Vertical edge', stride = 1, pad = 0, pos = 0, timer = null, output = {};
    const positions = () => {
      const M = N + 2 * pad, out = Math.floor((M - k) / stride) + 1, list = [];
      for (let ty = 0; ty < out; ty++) for (let tx = 0; tx < out; tx++) list.push({ tx: tx * stride, ty: ty * stride, ox: tx, oy: ty });
      return list;
    };
    const padVal = (x, y) => (x < pad || y < pad || x >= pad + N || y >= pad + N) ? 0 : input[y - pad][x - pad];
    const computeAt = (tx, ty) => { const { k: kern, norm } = presets[presetName]; let sum = 0; for (let ky = 0; ky < k; ky++) for (let kx = 0; kx < k; kx++) sum += kern[ky][kx] * norm * padVal(tx + kx, ty + ky); return sum; };
    const cellBg = v => `color-mix(in srgb, var(--text) ${Math.round(Math.max(0, Math.min(1, v)) * 100)}%, var(--crust))`;
    const signBg = v => v === 0 ? 'var(--base)' : v > 0 ? `color-mix(in srgb, var(--red) ${Math.min(100, Math.round(Math.abs(v) * 40))}%, var(--base))` : `color-mix(in srgb, var(--blue) ${Math.min(100, Math.round(Math.abs(v) * 40))}%, var(--base))`;
    const render = () => {
      // the highlighted window is the one just computed (or the first one before any step), so the grid and the maths panel agree
      const list = positions(), at = Math.max(0, Math.min(pos, list.length) - 1), cur = list[at], M = N + 2 * pad;
      let inputHTML = `<div class="cvgrid" style="grid-template-columns:repeat(${M},26px)">`;
      for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) { const v = padVal(x, y), hit = cur && x >= cur.tx && x < cur.tx + k && y >= cur.ty && y < cur.ty + k; inputHTML += `<div class="cvcell${hit ? ' hit' : ''}" style="background:${cellBg(v)}">${v.toFixed(1)}</div>`; }
      inputHTML += '</div>';
      const { k: kern, norm } = presets[presetName];
      let kernelHTML = `<div class="cvgrid" style="grid-template-columns:repeat(${k},26px)">`;
      for (let ky = 0; ky < k; ky++) for (let kx = 0; kx < k; kx++) kernelHTML += `<div class="cvcell" style="background:${signBg(kern[ky][kx] * norm * 6)}">${norm !== 1 ? kern[ky][kx] + '/9' : kern[ky][kx]}</div>`;
      kernelHTML += '</div>';
      const outSize = Math.floor((M - k) / stride) + 1;
      let outputHTML = `<div class="cvgrid" style="grid-template-columns:repeat(${outSize},26px)">`;
      for (let oy = 0; oy < outSize; oy++) for (let ox = 0; ox < outSize; ox++) { const v = output[ox + ',' + oy]; outputHTML += `<div class="cvcell" style="background:${v === undefined ? 'var(--base)' : signBg(v)}">${v === undefined ? '' : v.toFixed(1)}</div>`; }
      outputHTML += '</div>';
      $('#cv-input').innerHTML = inputHTML; $('#cv-kernel').innerHTML = kernelHTML; $('#cv-output').innerHTML = outputHTML;
      $('#cv-formula').innerHTML = `Output size = (9 + 2×${pad} − 3) / ${stride} + 1 = <b>${outSize}×${outSize}</b>`;
      // the maths of this one window: patch × kernel, cell by cell, then the sum that lands in the output
      const g = cells => `<div class="cvgrid" style="grid-template-columns:repeat(3,auto)">${cells.join('')}</div>`;
      const patch = [], kc = [], prod = [];
      let sum = 0;
      for (let ky = 0; ky < k; ky++) for (let kx = 0; kx < k; kx++) {
        const v = padVal(cur.tx + kx, cur.ty + ky), w = kern[ky][kx] * norm, p = v * w; sum += p;
        patch.push(`<div class="cvcell" style="background:${cellBg(v)}">${v.toFixed(1)}</div>`);
        kc.push(`<div class="cvcell" style="background:${signBg(w * 6)}">${norm !== 1 ? kern[ky][kx] + '/9' : kern[ky][kx]}</div>`);
        prod.push(`<div class="cvcell" style="background:${signBg(p * 3)}">${p.toFixed(2)}</div>`);
      }
      $('#cv-math').innerHTML = `<p class="wgt2">Step ${at + 1} of ${list.length}: multiply cell by cell at position (${cur.ox}, ${cur.oy})</p>
        <div class="cvmath"><div><span>Input patch</span>${g(patch)}</div><i>×</i><div><span>Kernel</span>${g(kc)}</div><i>=</i><div><span>Each cell</span>${g(prod)}</div><i>sum</i><b>${sum.toFixed(2)}</b></div>`;
      $('#cv-say').textContent = pos >= list.length ? 'Done: every position computed.' : pos === 0 ? 'Press Step to compute the first window.' : `${pos} of ${list.length} positions computed.`;
    };
    const stepOnce = () => { const list = positions(); if (pos >= list.length) { if (timer) { clearInterval(timer); timer = null; } $('#cv-play').textContent = 'Play'; return; } const cur = list[pos]; output[cur.ox + ',' + cur.oy] = computeAt(cur.tx, cur.ty); pos++; render(); };
    const reset = () => { pos = 0; output = {}; if (timer) { clearInterval(timer); timer = null; } $('#cv-play').textContent = 'Play'; render(); };
    el.innerHTML = `<p class="wgt">Try it: slide the kernel</p>
      <div class="tb"><span>Kernel</span><span class="opts" id="cv-presets"></span><span class="sp"></span>
        <button class="bt act" id="cv-play" type="button">Play</button><button class="bt" id="cv-step" type="button">Step</button><button class="bt" id="cv-reset" type="button">Reset</button></div>
      <div class="tb ro"><span>Stride</span><span class="opts" id="cv-stride"></span><span>Padding</span><span class="opts" id="cv-pad"></span><span id="cv-formula"></span></div>
      <div class="convgrids">
        <div><p class="wgt2">Input (9×9)</p><div id="cv-input"></div></div>
        <div><p class="wgt2">Kernel (3×3)</p><div id="cv-kernel"></div></div>
        <div><p class="wgt2">Output</p><div id="cv-output"></div></div>
      </div>
      <div id="cv-math"></div>
      <p class="wgcap" id="cv-say"></p>`;
    $('#cv-presets').innerHTML = Object.keys(presets).map((n, i) => `<button type="button" class="bt${i === 0 ? ' on' : ''}" data-p="${n}">${n}</button>`).join('');
    $('#cv-stride').innerHTML = [1, 2].map(s => `<button type="button" class="bt${s === 1 ? ' on' : ''}" data-s="${s}">${s}</button>`).join('');
    $('#cv-pad').innerHTML = [0, 1].map(p => `<button type="button" class="bt${p === 0 ? ' on' : ''}" data-pad="${p}">${p}</button>`).join('');
    $('#cv-presets').onclick = e => { const b = e.target.closest('button'); if (!b) return; presetName = b.dataset.p; $$('#cv-presets button').forEach(x => x.classList.toggle('on', x === b)); reset(); };
    $('#cv-stride').onclick = e => { const b = e.target.closest('button'); if (!b) return; stride = +b.dataset.s; $$('#cv-stride button').forEach(x => x.classList.toggle('on', x === b)); reset(); };
    $('#cv-pad').onclick = e => { const b = e.target.closest('button'); if (!b) return; pad = +b.dataset.pad; $$('#cv-pad button').forEach(x => x.classList.toggle('on', x === b)); reset(); };
    $('#cv-step').onclick = () => { if (timer) { clearInterval(timer); timer = null; $('#cv-play').textContent = 'Play'; } stepOnce(); };
    $('#cv-play').onclick = () => {
      if (timer) { clearInterval(timer); timer = null; $('#cv-play').textContent = 'Play'; return; }
      if (pos >= positions().length) reset();
      $('#cv-play').textContent = 'Pause';
      timer = trackTimer(setInterval(stepOnce, 350));
    };
    $('#cv-reset').onclick = reset;
    render();
  },
  // an unrolled hidden state, stepping through time; toy formulas contrast plain-RNN decay, LSTM-style gating and GRU-style interpolation
  // ponytail: simplified teaching formulas, not real LSTM/GRU gate equations, swap in the real gate maths if this ever needs to be numerically exact
  rnnunroll(el) {
    const xs = [3, -1, 2, 5, -4, 1];
    const gates = [1, 1, 0, 1, 0, 1];
    let mode = 'Plain RNN', t = 0, timer = null;
    const step = (h, x) => Math.tanh(0.5 * h + x * 0.3) * 0.55;
    const stepLSTM = (h, x, gate) => gate ? Math.max(-3, Math.min(3, 0.9 * h + x * 0.15)) : x * 0.3;
    // toy GRU: an update gate blends the old state with a fresh candidate, instead of the LSTM's hard keep/replace switch
    const stepGRU = (h, x, gate) => { const z = gate ? 0.15 : 0.8; const cand = Math.tanh(x * 0.4); return (1 - z) * h + z * cand; };
    const fns = { 'Plain RNN': (h, x, g) => step(h, x), 'LSTM gates': stepLSTM, 'GRU gates': stepGRU };
    const compute = () => { let h = 0; const hs = [0]; const f = fns[mode]; for (let i = 0; i < xs.length; i++) { h = f(h, xs[i], gates[i]); hs.push(h); } return hs; };
    const render = () => {
      const hs = compute();
      $('#rn-row').innerHTML = xs.map((x, i) => {
        const h = hs[i + 1], seen = i <= t, pct = Math.min(100, Math.abs(h) / 3 * 100);
        return `<div class="rnncell${i === t ? ' on' : ''}${!seen ? ' dim' : ''}"><i>x=${x}</i><div class="rnnbar"><em style="height:${seen ? pct : 0}%"></em></div><b>${seen ? h.toFixed(2) : '·'}</b></div>`;
      }).join('<span class="rnnarrow">→</span>');
      $('#rn-say').textContent = t >= xs.length - 1
        ? (mode === 'Plain RNN' ? 'By the last step, the hidden state has shrunk close to zero: the early input is forgotten. That is the vanishing gradient problem.'
          : mode === 'LSTM gates' ? 'With gates open most steps, the hidden state stays large much longer: the network can still "remember" the early input.'
            : 'GRU blends old and new every step instead of fully overwriting, so it also keeps more of the early signal than a plain RNN.')
        : `Step ${t + 1} of ${xs.length}.`;
    };
    el.innerHTML = `<p class="wgt">Try it: step through time</p>
      <div class="tb"><span class="wgsub">Cell</span><span class="opts" id="rn-mode"></span><span class="sp"></span><button class="bt act" id="rn-play" type="button">Play</button><button class="bt" id="rn-step" type="button">Step</button><button class="bt" id="rn-reset" type="button">Reset</button></div>
      <div class="rnnrow" id="rn-row"></div>
      <p class="wgcap" id="rn-say"></p>`;
    $('#rn-mode').innerHTML = Object.keys(fns).map((n, i) => `<button type="button" class="bt${i === 0 ? ' on' : ''}" data-m="${n}">${n}</button>`).join('');
    const resetAll = () => { t = 0; if (timer) { clearInterval(timer); timer = null; } $('#rn-play').textContent = 'Play'; render(); };
    $('#rn-mode').onclick = e => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; $$('#rn-mode button').forEach(x => x.classList.toggle('on', x === b)); resetAll(); };
    $('#rn-step').onclick = () => { if (timer) { clearInterval(timer); timer = null; $('#rn-play').textContent = 'Play'; } t = Math.min(t + 1, xs.length - 1); render(); };
    $('#rn-play').onclick = () => {
      if (timer) { clearInterval(timer); timer = null; $('#rn-play').textContent = 'Play'; return; }
      if (t >= xs.length - 1) resetAll();
      $('#rn-play').textContent = 'Pause';
      timer = trackTimer(setInterval(() => { t++; if (t >= xs.length - 1) { t = xs.length - 1; render(); clearInterval(timer); timer = null; $('#rn-play').textContent = 'Play'; return; } render(); }, 650));
    };
    $('#rn-reset').onclick = resetAll;
    render();
  },
  // seq2seq: an encoder reads the whole input one token at a time, then a decoder emits the (differently-sized) output one token at a time
  seq2seqdemo(el) {
    const inp = ['I', 'am', 'happy'], out = ['Estoy', 'feliz'];
    const decStart = inp.length + 1, maxT = inp.length + out.length;
    let t = 0, timer = null;
    const render = () => {
      const encHTML = inp.map((w, i) => `<div class="rnncell${i === t ? ' on' : ''}${i < t ? ' dim' : ''}"><i>in</i><b>${w}</b></div>`).join('<span class="rnnarrow">→</span>');
      const ctxDone = t >= inp.length;
      const ctxHTML = `<div class="rnncell ctx${ctxDone ? ' on' : ''}"><i>ctx</i><b>${ctxDone ? '●' : '·'}</b></div>`;
      const outHTML = out.map((w, i) => { const at = decStart + i, emitted = t >= at; return `<div class="rnncell${t === at ? ' on' : ''}${!emitted ? ' dim' : ''}"><i>out</i><b>${emitted ? w : '·'}</b></div>`; }).join('<span class="rnnarrow">→</span>');
      $('#s2-row').innerHTML = `${encHTML}<span class="rnnarrow">→</span>${ctxHTML}<span class="rnnarrow">→</span>${outHTML}`;
      $('#s2-say').textContent = t < inp.length ? `Encoder reading input word ${t + 1} of ${inp.length}: "${inp[t]}".`
        : t === inp.length ? 'Encoder done: the whole input is compressed into one context vector, the only thing the decoder gets to see.'
          : `Decoder emitting output word ${t - decStart + 1} of ${out.length}, three in and two out: the lengths don't have to match.`;
    };
    el.innerHTML = `<p class="wgt">Try it: step the encoder, then the decoder</p>
      <div class="rnnrow" id="s2-row"></div>
<div class="tb"><span class="sp"></span><button class="bt act" id="s2-play" type="button">Play</button><button class="bt" id="s2-step" type="button">Step</button><button class="bt" id="s2-reset" type="button">Reset</button></div>
      <p class="wgcap" id="s2-say"></p>`;
    const resetAll = () => { t = 0; if (timer) { clearInterval(timer); timer = null; } $('#s2-play').textContent = 'Play'; render(); };
    $('#s2-step').onclick = () => { if (timer) { clearInterval(timer); timer = null; $('#s2-play').textContent = 'Play'; } t = Math.min(t + 1, maxT); render(); };
    $('#s2-play').onclick = () => {
      if (timer) { clearInterval(timer); timer = null; $('#s2-play').textContent = 'Play'; return; }
      if (t >= maxT) resetAll();
      $('#s2-play').textContent = 'Pause';
      timer = trackTimer(setInterval(() => { t++; if (t >= maxT) { t = maxT; render(); clearInterval(timer); timer = null; $('#s2-play').textContent = 'Play'; return; } render(); }, 700));
    };
    $('#s2-reset').onclick = resetAll;
    render();
  },
  // click (or auto-step) a token to see its attention weights over the whole sentence; two heads, two different patterns
  attentionmap(el) {
    const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
    // hand-authored raw attention scores per query row, illustrative, not a trained model's real weights
    // Head 1: roughly semantic (subject/object style long-range links)
    const raw1 = [
      [3, 1, 0.5, 0.2, 2, 0.2],
      [1, 3, 1.5, 0.3, 0.5, 0.4],
      [0.3, 2.5, 2, 1, 0.3, 0.6],
      [0.2, 0.4, 1.5, 2.5, 0.5, 1.8],
      [2.5, 0.5, 0.3, 0.4, 2.5, 0.4],
      [0.2, 0.5, 0.8, 2.2, 0.5, 2.8],
    ];
    // Head 2: local/positional (mostly attends to its immediate neighbours), a genuinely different pattern
    const raw2 = [
      [2, 2, 0.3, 0.2, 0.2, 0.2],
      [2, 1.5, 2, 0.3, 0.2, 0.2],
      [0.3, 2, 1.5, 2, 0.3, 0.2],
      [0.2, 0.3, 2, 1.5, 2, 0.3],
      [0.2, 0.2, 0.3, 2, 1.5, 2],
      [0.2, 0.2, 0.2, 0.3, 2, 2],
    ];
    const soft = row => { const m = Math.max(...row), ex = row.map(v => Math.exp(v - m)), s = ex.reduce((a, b) => a + b, 0); return ex.map(v => v / s); };
    const heads = { 'Head 1': raw1.map(soft), 'Head 2': raw2.map(soft) };
    let head = 'Head 1', q = 0, timer = null;
    const render = () => {
      const w = heads[head][q], n = tokens.length, W = 420, H = 150, xAt = i => 30 + i * ((W - 60) / (n - 1));
      $$('#am-tokens button').forEach((b, i) => b.classList.toggle('on', i === q));
      let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}">`;
      tokens.forEach((t, i) => svg += `<path d="M${xAt(q)},${H - 30} Q${(xAt(q) + xAt(i)) / 2},20 ${xAt(i)},${H - 30}" fill="none" stroke="var(--mauve)" stroke-width="${0.5 + w[i] * 5}" opacity="${0.15 + w[i] * 0.8}"/>`);
      tokens.forEach((t, i) => svg += `<circle cx="${xAt(i)}" cy="${H - 30}" r="${i === q ? 7 : 5}" fill="${i === q ? 'var(--mauve)' : 'var(--base)'}" stroke="var(--sub0)"/><text x="${xAt(i)}" y="${H - 10}" text-anchor="middle" font-size="10" fill="var(--text)">${t}</text>`);
      svg += '</svg>';
      $('#am-svg').innerHTML = svg;
      $('#am-rows').innerHTML = tokens.map((t, i) => `<div><code>${t}</code><span class="ok">${(w[i] * 100).toFixed(0)}%</span></div>`).join('');
      $('#am-say').textContent = `${head}, query "${tokens[q]}": most attention on "${tokens[w.indexOf(Math.max(...w))]}". ${head === 'Head 1' ? 'This head tends to link meaning-related words however far apart they are.' : 'This head mostly just looks at its immediate neighbours.'}`;
    };
    el.innerHTML = `<p class="wgt">Try it: pick the query word and the head</p>
      <div class="tb"><span class="wgsub">Head</span><span class="opts" id="am-heads"></span><span class="wgsub">Query</span><span class="opts" id="am-tokens"></span><span class="sp"></span><button class="bt act" id="am-play" type="button">Play</button><button class="bt" id="am-step" type="button">Step</button><button class="bt" id="am-reset" type="button">Reset</button></div>
      <div class="nndiag" id="am-svg"></div>
      <div class="wgtable h" id="am-rows"></div>
      <p class="wgcap" id="am-say"></p>`;
    $('#am-heads').innerHTML = Object.keys(heads).map((n, i) => `<button type="button" class="bt${i === 0 ? ' on' : ''}" data-h="${n}">${n}</button>`).join('');
    $('#am-tokens').innerHTML = tokens.map((t, i) => `<button type="button" class="bt${i === 0 ? ' on' : ''}">${t}</button>`).join('');
    $('#am-heads').onclick = e => { const b = e.target.closest('button'); if (!b) return; head = b.dataset.h; $$('#am-heads button').forEach(x => x.classList.toggle('on', x === b)); render(); };
    $('#am-tokens').onclick = e => { const b = e.target.closest('button'); if (!b) return; q = [...$$('#am-tokens button')].indexOf(b); render(); };
    $('#am-step').onclick = () => { if (timer) { clearInterval(timer); timer = null; $('#am-play').textContent = 'Play'; } q = (q + 1) % tokens.length; render(); };
    $('#am-reset').onclick = () => { if (timer) { clearInterval(timer); timer = null; } $('#am-play').textContent = 'Play'; q = 0; render(); };
    $('#am-play').onclick = () => {
      if (timer) { clearInterval(timer); timer = null; $('#am-play').textContent = 'Play'; return; }
      $('#am-play').textContent = 'Pause';
      timer = trackTimer(setInterval(() => { q = (q + 1) % tokens.length; render(); }, 900));
    };
    render();
  },
  // a different sine wave per dimension: the fixed pattern positional encoding adds to every token
  posenc(el) {
    const dims = [0, 1, 2, 3], colors = ['var(--mauve)', 'var(--blue)', 'var(--green)', 'var(--peach)'];
    const series = dims.map(d => ({ pts: Array.from({ length: 41 }, (_, i) => [i, Math.sin(i / Math.pow(10000, d / 4))]), color: colors[d] }));
    el.innerHTML = `<p class="wgt">Positional encoding: a different wave per dimension</p>
      <div class="nndiag">${curveSVG(series, { xMin: 0, xMax: 40, yMin: -1, yMax: 1, xLabel: 'position in the sentence', yLabel: 'encoding value' })}</div>
      <p class="wgcap">Every position gets its own fixed pattern of wave values, one per dimension, so the network can tell word order apart without attention alone noticing it.</p>`;
  },
  // decoder-only, autoregressive generation: one hand-picked next word per step, always re-reading everything generated so far
  autogen(el) {
    const prompt = ['The', 'weather', 'today', 'is'];
    const nextWords = ['sunny', 'and', 'warm', '.'];
    let t = 0, timer = null;
    const render = () => {
      $('#ag-sent').innerHTML = [...prompt.map(w => `<span>${w}</span>`), ...nextWords.slice(0, t).map(w => `<span class="on">${w}</span>`)].join(' ');
      $('#ag-say').textContent = t === 0 ? 'Nothing generated yet. A decoder-only model like GPT only ever looks backward, at the prompt and whatever it has written so far.'
        : t >= nextWords.length ? 'Done. The model keeps re-reading the whole sentence so far before every single new word, prompt included.'
          : `Generated ${t} of ${nextWords.length} words. Word ${t + 1} will be chosen by re-reading everything to its left, nothing to its right.`;
    };
    el.innerHTML = `<p class="wgt">Try it: generate one word at a time</p>
      <p class="wgo" id="ag-sent"></p>
<div class="tb"><span class="sp"></span><button class="bt act" id="ag-play" type="button">Play</button><button class="bt" id="ag-step" type="button">Step</button><button class="bt" id="ag-reset" type="button">Reset</button></div>
      <p class="wgcap" id="ag-say"></p>`;
    const resetAll = () => { t = 0; if (timer) { clearInterval(timer); timer = null; } $('#ag-play').textContent = 'Play'; render(); };
    $('#ag-step').onclick = () => { if (timer) { clearInterval(timer); timer = null; $('#ag-play').textContent = 'Play'; } t = Math.min(t + 1, nextWords.length); render(); };
    $('#ag-reset').onclick = resetAll;
    $('#ag-play').onclick = () => {
      if (timer) { clearInterval(timer); timer = null; $('#ag-play').textContent = 'Play'; return; }
      if (t >= nextWords.length) resetAll();
      $('#ag-play').textContent = 'Pause';
      timer = trackTimer(setInterval(() => { t++; if (t >= nextWords.length) { t = nextWords.length; render(); clearInterval(timer); timer = null; $('#ag-play').textContent = 'Play'; return; } render(); }, 550));
    };
    render();
  },
  // noise slowly denoised into a target pattern, step by step, with scrub + play; pick which target shape it denoises toward
  diffusionsteps(el) {
    const n = 8, total = 20;
    const shapes = {
      Diamond: (x, y) => { const d = Math.abs(x - 3.5) + Math.abs(y - 3.5); return d > 2 && d < 4.5 ? 1 : 0; },
      Circle: (x, y) => Math.hypot(x - 3.5, y - 3.5) < 3 ? 1 : 0,
      Cross: (x, y) => (Math.abs(x - 3.5) < 1.2 || Math.abs(y - 3.5) < 1.2) ? 1 : 0,
    };
    const targetFor = name => { const t = []; const f = shapes[name]; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) t.push(f(x, y)); return t; };
    const rnd = seeded(9);
    const noise = Array.from({ length: n * n }, () => rnd());
    const jitter = Array.from({ length: n * n }, () => rnd() - 0.5);
    let shapeName = 'Diamond', target = targetFor(shapeName), step = 0, timer = null;
    const cellsAt = s => { const mix = s / total; return target.map((tgt, i) => noise[i] * (1 - mix) + tgt * mix + jitter[i] * 0.15 * (1 - mix)); };
    const render = () => {
      const vals = cellsAt(step);
      $('#df-grid').innerHTML = `<div class="cvgrid" style="grid-template-columns:repeat(${n},26px)">${vals.map(v => `<div class="cvcell" style="background:color-mix(in srgb, var(--mauve) ${Math.round(Math.max(0, Math.min(1, v)) * 100)}%, var(--crust))"></div>`).join('')}</div>`;
      $('#df-sv').textContent = step;
      $('#df-say').textContent = step === 0 ? 'Pure noise: step 0.' : step >= total ? `Fully denoised: the model has turned noise into a recognisable ${shapeName.toLowerCase()}.` : `Step ${step} of ${total}: still denoising toward the ${shapeName.toLowerCase()}.`;
    };
    el.innerHTML = `<p class="wgt">Try it: scrub the denoising steps</p>
      <div class="tb"><span class="wgsub">Target</span><span class="opts" id="df-shapes"></span><span class="sp"></span><button class="bt act" id="df-play" type="button">Play</button><button class="bt" id="df-reset" type="button">Reset</button></div>
      <div class="tb ro"><label>Step <input id="df-step" type="range" min="0" max="${total}" value="0"></label><b id="df-sv">0</b></div>
      <div class="nndiag" id="df-grid"></div>
      <p class="wgcap" id="df-say"></p>`;
    $('#df-shapes').innerHTML = Object.keys(shapes).map((n, i) => `<button type="button" class="bt${i === 0 ? ' on' : ''}" data-s="${n}">${n}</button>`).join('');
    $('#df-shapes').onclick = e => { const b = e.target.closest('button'); if (!b) return; shapeName = b.dataset.s; target = targetFor(shapeName); $$('#df-shapes button').forEach(x => x.classList.toggle('on', x === b)); step = 0; $('#df-step').value = 0; render(); };
    $('#df-step').addEventListener('input', () => { step = +$('#df-step').value; render(); });
    $('#df-reset').onclick = () => { if (timer) { clearInterval(timer); timer = null; $('#df-play').textContent = 'Play'; } step = 0; $('#df-step').value = 0; render(); };
    $('#df-play').onclick = () => {
      if (timer) { clearInterval(timer); timer = null; $('#df-play').textContent = 'Play'; return; }
      if (step >= total) { step = 0; $('#df-step').value = 0; }
      $('#df-play').textContent = 'Pause';
      timer = trackTimer(setInterval(() => { step++; $('#df-step').value = step; render(); if (step >= total) { clearInterval(timer); timer = null; $('#df-play').textContent = 'Play'; } }, 220));
    };
    render();
  },
  // a static 2D latent space: three clusters, the autoencoder/VAE picture
  latentscatter(el) {
    const rnd = seeded(13);
    const cluster = (cx, cy, color) => Array.from({ length: 10 }, () => ({ x: cx + (rnd() - 0.5) * 2.4, y: cy + (rnd() - 0.5) * 2.4, color }));
    const pts = [...cluster(2, 2, 'var(--sky)'), ...cluster(8, 3, 'var(--peach)'), ...cluster(5, 8, 'var(--green)')];
    el.innerHTML = `<p class="wgt">A 2D latent space</p>
      <div class="nndiag">${scatterSVG(pts, { xMin: -1, xMax: 11, yMin: -1, yMax: 11, xLabel: 'latent dim 1', yLabel: 'latent dim 2' })}</div>
      <p class="wgcap">An autoencoder squeezes each input down to just a couple of numbers. Similar inputs land near each other, which is why you can walk between two points and get a smooth blend of the two.</p>`;
  },
  // GAN as a tug of war: a generator-quality number slowly climbs while a discriminator-confidence number settles, over seeded "training steps"
  gantugofwar(el) {
    const total = 20;
    const rnd = seeded(31);
    const noiseAt = s => (rnd() - 0.5) * Math.max(0, 1 - s / total) * 18;
    let step = 0, timer = null;
    const genQuality = s => Math.min(96, 8 + 88 * (1 - Math.exp(-s / 8)));
    const discConf = s => Math.max(52, 96 - 44 * (1 - Math.exp(-s / 10)));
    const render = () => {
      const g = Math.max(2, Math.min(98, genQuality(step) + noiseAt(step)));
      const d = Math.max(50, Math.min(99, discConf(step) + noiseAt(step) * 0.4));
      $('#gn-bars').innerHTML = `<div class="wgbars">
        <div class="wgbar"><i style="height:${g}%;background:var(--green)"></i><b>${g.toFixed(0)}%</b><span>Generator: fake looks real</span></div>
        <div class="wgbar"><i style="height:${d}%;background:var(--red)"></i><b>${d.toFixed(0)}%</b><span>Discriminator: confidence telling real from fake</span></div>
      </div>`;
      $('#gn-say').textContent = step === 0 ? 'Step 0: the generator makes obvious fakes, the discriminator spots them easily.'
        : step >= total ? 'After enough rounds, the generator\'s fakes score in the high 80s while the discriminator\'s confidence has fallen into the high 50s: barely better than guessing. That gap closing is the "competing" part of GAN.'
          : `Step ${step} of ${total}: both networks are still improving against each other.`;
    };
    el.innerHTML = `<p class="wgt">Try it: train the tug of war</p>
      <div id="gn-bars"></div>
<div class="tb"><span class="sp"></span><button class="bt act" id="gn-play" type="button">Play</button><button class="bt" id="gn-step" type="button">Step</button><button class="bt" id="gn-reset" type="button">Reset</button></div>
      <p class="wgcap" id="gn-say"></p>`;
    const resetAll = () => { step = 0; if (timer) { clearInterval(timer); timer = null; } $('#gn-play').textContent = 'Play'; render(); };
    $('#gn-step').onclick = () => { if (timer) { clearInterval(timer); timer = null; $('#gn-play').textContent = 'Play'; } step = Math.min(step + 1, total); render(); };
    $('#gn-reset').onclick = resetAll;
    $('#gn-play').onclick = () => {
      if (timer) { clearInterval(timer); timer = null; $('#gn-play').textContent = 'Play'; return; }
      if (step >= total) resetAll();
      $('#gn-play').textContent = 'Pause';
      timer = trackTimer(setInterval(() => { step++; if (step >= total) { step = total; render(); clearInterval(timer); timer = null; $('#gn-play').textContent = 'Play'; return; } render(); }, 260));
    };
    render();
  },
  // next-token probabilities with a temperature slider, and a sample button that builds a sentence
  tokensample(el) {
    const words = ['mat', 'floor', 'chair', 'roof', 'moon', 'table'];
    const logits = [4.2, 2.6, 2.1, 0.6, -0.5, 1.8];
    let temp = 1, generated = [];
    const rnd = seeded(17);
    const probs = t => { const z = logits.map(l => l / Math.max(0.1, t)), m = Math.max(...z), ex = z.map(v => Math.exp(v - m)), s = ex.reduce((a, b) => a + b, 0); return ex.map(v => v / s); };
    const render = () => {
      const p = probs(temp);
      $('#tk-bars').innerHTML = `<div class="wgbars">${words.map((w, i) => `<div class="wgbar"><i style="height:${Math.max(2, p[i] * 100)}%"></i><b>${(p[i] * 100).toFixed(0)}%</b><span>${w}</span></div>`).join('')}</div>`;
      $('#tk-sent').textContent = `The cat sat on the${generated.length ? ' ' + generated.join(' ') : ''} …`;
      $('#tk-tv').textContent = temp.toFixed(2);
    };
    el.innerHTML = `<p class="wgt">Try it: change the temperature and sample</p>
      <div class="tb ro"><label>Temperature <input id="tk-t" type="range" min="0.2" max="2" step="0.1" value="1"></label><b id="tk-tv">1.00</b></div>
      <div id="tk-bars"></div>
      <div class="tb ro"><button class="bt act" id="tk-sample" type="button">Sample next word</button><button class="bt" id="tk-reset" type="button">Reset</button></div>
      <p class="wgo" id="tk-sent"></p>
      <p class="wgcap">Low temperature always picks the top word. High temperature flattens the odds, so rarer words get a real chance.</p>`;
    $('#tk-t').addEventListener('input', () => { temp = +$('#tk-t').value; render(); });
    $('#tk-sample').onclick = () => { const p = probs(temp); let r = rnd(), acc = 0, pick = words.length - 1; for (let i = 0; i < p.length; i++) { acc += p[i]; if (r <= acc) { pick = i; break; } } generated.push(words[pick]); render(); };
    $('#tk-reset').onclick = () => { generated = []; render(); };
    render();
  },
  // real tabular Q-learning over a tiny grid world: train more episodes, watch the greedy path shorten, then play it out
  gridworld(el) {
    const size = 4, goal = size * size - 1, actions = [[-1, 0], [1, 0], [0, -1], [0, 1]], idx = (r, c) => r * size + c;
    const rnd = seeded(23);
    let Q = Array.from({ length: size * size }, () => [0, 0, 0, 0]);
    const episodeCounts = [0, 2, 5, 10, 20, 40], snapshots = [], qSnapshots = [];
    const trainEpisodes = n => { for (let e = 0; e < n; e++) { let r = 0, c = 0, steps = 0; while (idx(r, c) !== goal && steps < 40) { const s = idx(r, c), a = rnd() < 0.2 ? Math.floor(rnd() * 4) : Q[s].indexOf(Math.max(...Q[s])); const nr = Math.max(0, Math.min(size - 1, r + actions[a][0])), nc = Math.max(0, Math.min(size - 1, c + actions[a][1])), ns = idx(nr, nc), reward = ns === goal ? 10 : -1; Q[s][a] += 0.3 * (reward + 0.9 * Math.max(...Q[ns]) - Q[s][a]); r = nr; c = nc; steps++; } } };
    let prevCount = 0;
    episodeCounts.forEach(n => {
      trainEpisodes(n - prevCount); prevCount = n;
      let r = 0, c = 0, steps = 0; const path = [idx(0, 0)];
      while (idx(r, c) !== goal && steps < 30) { const s = idx(r, c), a = Q[s].indexOf(Math.max(...Q[s])); r = Math.max(0, Math.min(size - 1, r + actions[a][0])); c = Math.max(0, Math.min(size - 1, c + actions[a][1])); steps++; path.push(idx(r, c)); }
      snapshots.push(path);
      qSnapshots.push(Q.map(row => [...row])); // Q at exactly this many training episodes, so the overlay matches the slider, not the final trained table
    });
    let snapIdx = 0, playPos = 0, timer = null, showQ = false;
    const qMaxAt = i => Math.max(...qSnapshots[snapIdx][i]);
    const drawGrid = (path, pos) => {
      const qmax = Array.from({ length: size * size }, (_, i) => qMaxAt(i));
      const qhi = Math.max(0.001, ...qmax.map(v => Math.max(0, v)));
      let html = `<div class="cvgrid" style="grid-template-columns:repeat(${size},34px)">`;
      for (let i = 0; i < size * size; i++) {
        const onPath = path.includes(i), isCur = path[pos] === i, isGoal = i === goal, isStart = i === 0;
        let bg = isCur ? 'var(--mauve)' : isGoal ? 'var(--green)' : isStart ? 'var(--blue)' : onPath ? 'var(--s1)' : 'var(--base)';
        if (showQ && !isCur && !isGoal && !isStart) { const t = Math.max(0, qmax[i]) / qhi; bg = `color-mix(in srgb, var(--peach) ${Math.round(t * 70)}%, var(--base))`; }
        html += `<div class="cvcell" style="background:${bg};border-radius:6px">${isGoal ? 'G' : isStart ? 'S' : ''}</div>`;
      }
      html += '</div>'; $('#gw-grid').innerHTML = html;
    };
    const render = () => {
      $('#gw-epv').textContent = episodeCounts[snapIdx];
      const path = snapshots[snapIdx]; playPos = Math.min(playPos, path.length - 1);
      drawGrid(path, playPos);
      $('#gw-say').textContent = `After ${episodeCounts[snapIdx]} training episodes, the greedy path is ${path.length - 1} steps long.${showQ ? ' The peach shade is each cell\'s best learned Q-value: brighter means the agent has learned that square leads somewhere good.' : ''}`;
    };
    el.innerHTML = `<p class="wgt">Try it: train the agent, then watch it walk the path</p>
      <div class="tb"><span>Q-values</span><span class="opts" id="gw-qtoggle"></span><span class="sp"></span><button class="bt act" id="gw-play" type="button">Play</button><button class="bt" id="gw-reset" type="button">Reset</button></div>
      <div class="tb ro"><label>Episodes trained <input id="gw-ep" type="range" min="0" max="${episodeCounts.length - 1}" value="0"></label><b id="gw-epv"></b></div>
      <div class="nndiag" id="gw-grid"></div>
      <p class="wgcap" id="gw-say"></p>`;
    $('#gw-qtoggle').innerHTML = ['Off', 'On'].map((n, i) => `<button type="button" class="bt${i === 0 ? ' on' : ''}" data-q="${i}">${n}</button>`).join('');
    $('#gw-qtoggle').onclick = e => { const b = e.target.closest('button'); if (!b) return; showQ = b.dataset.q === '1'; $$('#gw-qtoggle button').forEach(x => x.classList.toggle('on', x === b)); render(); };
    $('#gw-ep').addEventListener('input', () => { snapIdx = +$('#gw-ep').value; playPos = 0; render(); });
    $('#gw-reset').onclick = () => { playPos = 0; render(); };
    $('#gw-play').onclick = () => {
      if (timer) { clearInterval(timer); timer = null; $('#gw-play').textContent = 'Play'; return; }
      playPos = 0; $('#gw-play').textContent = 'Pause';
      timer = trackTimer(setInterval(() => { playPos++; const path = snapshots[snapIdx]; if (playPos >= path.length) { clearInterval(timer); timer = null; $('#gw-play').textContent = 'Play'; playPos = path.length - 1; } render(); }, 450));
    };
    render();
  },
  // RLHF made concrete: two candidate replies with reward-model scores, and a preference bar that nudges toward the higher-scoring one over a few steps
  rlhfnudge(el) {
    const prompt = 'A customer writes: "My order arrived broken."';
    const respA = { text: 'So sorry about that! Here is a refund and a replacement on the way.', reward: 8.4 };
    const respB = { text: 'Not my problem, try contacting someone else.', reward: 1.2 };
    const maxT = 6;
    let t = 0, timer = null;
    const render = () => {
      const target = respA.reward >= respB.reward ? 1 : 0;
      const pA = 0.5 + (target === 1 ? 0.46 : -0.46) * (t / maxT);
      const pB = 1 - pA;
      $('#rl-bars').innerHTML = `<div class="wgbars">
        <div class="wgbar"><i style="height:${pA * 100}%;background:var(--green)"></i><b>${(pA * 100).toFixed(0)}%</b><span>A: reward ${respA.reward}</span></div>
        <div class="wgbar"><i style="height:${pB * 100}%;background:var(--red)"></i><b>${(pB * 100).toFixed(0)}%</b><span>B: reward ${respB.reward}</span></div>
      </div>`;
      $('#rl-say').textContent = t === 0 ? 'Before any RLHF nudging, the policy is split roughly evenly between the two candidate responses.'
        : t >= maxT ? 'After enough nudges, the policy strongly favours response A, the one the reward model scored higher.'
          : `Nudge ${t} of ${maxT}: the policy is shifting toward whichever response the reward model preferred.`;
    };
    el.innerHTML = `<p class="wgt">Try it: nudge the policy with RLHF</p>
      <p class="wgcap">${mdEsc(prompt)}</p>
      <div class="wgtable"><div><code>A: ${respA.text}</code><span class="ok">reward ${respA.reward}</span></div><div><code>B: ${respB.text}</code><span class="bad">reward ${respB.reward}</span></div></div>
      <div id="rl-bars"></div>
<div class="tb"><span class="sp"></span><button class="bt act" id="rl-play" type="button">Play</button><button class="bt" id="rl-step" type="button">Step</button><button class="bt" id="rl-reset" type="button">Reset</button></div>
      <p class="wgcap" id="rl-say"></p>`;
    const resetAll = () => { t = 0; if (timer) { clearInterval(timer); timer = null; } $('#rl-play').textContent = 'Play'; render(); };
    $('#rl-step').onclick = () => { if (timer) { clearInterval(timer); timer = null; $('#rl-play').textContent = 'Play'; } t = Math.min(t + 1, maxT); render(); };
    $('#rl-reset').onclick = resetAll;
    $('#rl-play').onclick = () => {
      if (timer) { clearInterval(timer); timer = null; $('#rl-play').textContent = 'Play'; return; }
      if (t >= maxT) resetAll();
      $('#rl-play').textContent = 'Pause';
      timer = trackTimer(setInterval(() => { t++; if (t >= maxT) { t = maxT; render(); clearInterval(timer); timer = null; $('#rl-play').textContent = 'Play'; return; } render(); }, 500));
    };
    render();
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
      <div class="wgtable mono" id="w-rows"></div>`;
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
  if (x) { a.href = href(x.g, x.n); a.dataset.ch = slug(x.g) + '/' + slug(x.n); a.dataset.tip = `${label}: ${x.n}`; a.classList.remove('off'); }
  else { a.removeAttribute('href'); a.dataset.tip = `No ${label.toLowerCase()}`; a.classList.add('off'); }
}

function markSidebar(id) {
  $$('#tree a.on').forEach(a => a.classList.remove('on'));
  const a = $(`#tree a[data-ch="${id}"]`);
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
new ResizeObserver(fit).observe(cview);
fit();

async function loadChapter() {
  activeTimers.forEach(clearInterval); activeTimers = [];
  const id = chapterId();
  const idx = all.findIndex(x => slug(x.g) + '/' + slug(x.n) === id);
  if (idx < 0) { setNav($('#tprev'), null, 'Previous topic'); setNav($('#tnext'), null, 'Next topic'); $('#notepane').innerHTML = ''; setTitle('Chapter'); showMessage('Chapter not found', 'Pick one from the list on the left.'); return; }
  const entry = all[idx];
  setTitle(entry.n, entry);
  if (pretty) { const u = location.origin + pathById(id); $('link[rel=canonical]').href = u; $('meta[property="og:url"]').content = u; }
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
  const to = x => href(x.g, x.n) + `" data-ch="${slug(x.g)}/${slug(x.n)}`;
  lessonEl.innerHTML = `<h1>${esc(title)}</h1>${meta.summary ? `<p class="sum">${mdEsc(meta.summary)}</p>` : ''}${html}
    <div class="cta">
      <div class="ctat"><b>Finished this chapter?</b><span>Jot it down, tick it off, then keep going.</span></div>
      <div class="ctab">
        ${prev ? `<a class="btn danger prevbtn" href="${to(prev)}">${icon('caret-left')}Previous: ${esc(prev.n)}</a>` : ''}
        <button class="btn ghost" id="mark" type="button"></button>
        ${next ? `<a class="btn" href="${to(next)}"><span>Next: ${esc(next.n)}</span>${icon('caret-right')}</a>` : `<a class="btn" href="roadmap.html"><span>Roadmap</span>${icon('caret-right')}</a>`}
      </div>
    </div>`;
  Object.assign(widgets, window.moreWidgets || {});
  $$('[data-widget]').forEach(el => widgets[el.dataset.widget] && widgets[el.dataset.widget](el));
  const mark = $('#mark'), topmark = $('#topmark');
  const paint = () => {
    const isDone = (load('coder:done') || []).includes(id);
    mark.innerHTML = icon('check-circle') + (isDone ? 'Done' : 'Mark as done');
    mark.classList.toggle('on', isDone);
    topmark.classList.toggle('on', isDone);
    topmark.dataset.tip = isDone ? 'Done — click to unmark' : 'Mark as done';
    const f = $('#done');
    if (f && f.lastChild) f.lastChild.textContent = (load('coder:done') || []).length + '/' + all.length + ' done';
  };
  const toggleDone = () => {
    const d = load('coder:done') || [];
    writeJSON('coder:done', d.includes(id) ? d.filter(s => s !== id) : [...d, id]);
    if (!d.includes(id)) touchStreak();
    paint();
  };
  mark.onclick = toggleDone;
  topmark.onclick = toggleDone;
  paint();
  $('.view').scrollTop = 0;
}

// the chapter id comes from the path (/m5/ai-development/mlp) on the live site, from the hash (#ai-development/mlp) when opened locally
function chapterId() {
  const m = location.pathname.match(/^\/m\d\/([^/]+)\/([^/]+?)\/?$/);
  return m ? m[1] + '/' + m[2] : decodeURIComponent(location.hash.slice(1));
}
// on the live site chapter links are real paths; swap the chapter in place instead of reloading the whole page
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-ch]');
  if (!a || !pretty || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault(); history.pushState(null, '', a.getAttribute('href')); loadChapter();
});
addEventListener('popstate', loadChapter);
addEventListener('hashchange', loadChapter);
loadChapter();
