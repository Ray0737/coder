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
// a clickable step-by-step workflow: boxes in a row, a description and a code line for the chosen step
const flowWidget = (el, title, steps) => {
  el.innerHTML = `<p class="wgt">${title}</p><div class="flow"></div><div class="flowd"></div><div class="wgrow"><button type="button" class="seg2 fnext">Next step</button></div>`;
  let at = 0;
  const go = i => {
    at = i;
    el.querySelector('.flow').innerHTML = steps.map((s, k) => `<button type="button" class="fstep${k === at ? ' on' : ''}${k < at ? ' done' : ''}" data-i="${k}"><small>${k + 1}</small>${s.t}</button>`).join('');
    const s = steps[at];
    el.querySelector('.flowd').innerHTML = `<b>${s.t}</b><p>${s.d}</p>${s.code ? `<code>${s.code}</code>` : ''}`;
  };
  el.querySelector('.flow').onclick = e => { const b = e.target.closest('.fstep'); if (b) go(+b.dataset.i); };
  el.querySelector('.fnext').onclick = () => go((at + 1) % steps.length);
  el._reset = () => go(0);
  go(0);
};

// every widget with controls gets a Reset button that puts sliders and tabs back to how they started
const addReset = el => {
  const t = el.querySelector('.wgt');
  const tabs = '.seg2[data-k],.seg2[data-f],.seg2[data-v]';
  if (!t || [...el.querySelectorAll('button')].some(b => /^reset$/i.test(b.textContent.trim()))) return;
  if (!el._reset && !el.querySelector('input,' + tabs)) return;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'seg2 rst'; b.textContent = 'Reset';
  b.onclick = () => {
    if (el._reset) return el._reset();
    el.querySelectorAll('input').forEach(i => { i.value = i.defaultValue; i.dispatchEvent(new Event('input', { bubbles: true })); });
    el.querySelectorAll('.wgrow,.mntabs').forEach(r => { const f = r.querySelector(tabs); if (f && r.querySelectorAll(tabs).length > 1) f.click(); });
  };
  t.append(b);
};

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
      <div class="pcs" id="w-af-info"></div>
      <div class="nndiag" id="w-af-plot"></div>
      <div class="wgtable" id="w-af-rows"></div>`;
    const info = {"Step": ["Heaviside step function", "The original on/off switch of the 1950s perceptron. It checks whether the weighted sum is above zero and answers 1, otherwise 0. Its job: make a hard yes/no decision with nothing in between.", "Dead simple, a clear yes/no answer.", "No slope to learn from, and a tiny nudge can flip it. Practically never used in modern training."], "Sigmoid": ["Logistic function", "A smooth S-shaped curve that squashes any score into the range 0 to 1. Its job: turn a raw score into a \"how sure am I\" probability, which is why it suits a single yes/no output.", "Smooth, and its 0–1 output reads naturally as a probability, so it suits a yes/no output.", "Flat at both ends, so big inputs give almost no slope and learning stalls (the vanishing gradient, below). Never negative, which makes training less balanced."], "Softmax": ["Normalized exponential function", "Looks at all the scores together and shares out 100% between them, so the results add up to 1. Its job: sit on the output layer and pick one class out of several, like which digit from 0 to 9.", "A clean \"one pie, shared out\" answer across all classes.", "Only makes sense on the output layer, and it is built for one answer at a time, not \"several can be true at once\"."], "tanh": ["Hyperbolic tangent", "Sigmoid stretched to run from -1 to 1 and centred on 0. Its job: let a neuron push a signal down as well as up, mostly in hidden layers of older and recurrent networks.", "Centred on 0, which usually trains better than Sigmoid.", "Still goes flat at both ends, so it can still stall in deep networks."], "ReLU": ["Rectified Linear Unit", "Outputs 0 for anything negative and passes positive scores straight through. Its job: be the cheap, fast default in the hidden layers of most modern networks.", "Cheap, and never flat on the positive side, so deep networks train much faster.", "A neuron stuck on negative inputs outputs 0 and gets no slope, so it can \"die\" and stop learning."]};
    const EQ = { Step: 'f(x) = 1 if x > 0, otherwise 0', Sigmoid: 'f(x) = 1 / (1 + e^(-x))', Softmax: 'f(x\u1d62) = e^(x\u1d62) / sum of e^(x\u2c7c)', tanh: 'f(x) = (e^x - e^(-x)) / (e^x + e^(-x))', ReLU: 'f(x) = max(0, x)' };
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
      { const [fm, d, pr, c] = info[name], eq = EQ[name]; $('#w-af-info').innerHTML = `<div class="pc"><div class="pch"><b>${fm}</b><code>${eq}</code></div><div class="pcl"><div><em>What it does</em>${mdInline(d)}</div><div class="pro"><em>Pros</em>${mdInline(pr)}</div><div class="con"><em>Cons</em>${mdInline(c)}</div></div></div>`; }
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
  // features / label / classes on the classic iris table, plus a regression example
  featurelabel(el) {
    const sets = {
      Class: { fh: ['Sepal length (cm)', 'Sepal width (cm)', 'Petal length (cm)', 'Petal width (cm)'], lh: 'Species',
        rows: [[5.1, 3.5, 1.4, 0.2, 'setosa'], [4.9, 3.0, 1.4, 0.2, 'setosa'], [7.0, 3.2, 4.7, 1.4, 'versicolor'], [6.4, 3.2, 4.5, 1.5, 'versicolor'], [6.3, 3.3, 6.0, 2.5, 'virginica'], [5.8, 2.7, 5.1, 1.9, 'virginica']],
        q: [5.0, 3.4, 1.5, 0.2],
        note: 'This is the famous <b>iris</b> dataset: 150 flowers, 4 measurements each. Classes: <b class="fl-c">setosa</b>, <b class="fl-c">versicolor</b> and <b class="fl-c">virginica</b>. The label can only be one of these three.' },
      Number: { fh: ['Area (m²)', 'Bedrooms', 'Distance to city (km)'], lh: 'Price (k$)', rows: [[50, 1, 12, 150], [80, 2, 8, 240], [120, 3, 5, 380], [65, 2, 15, 170]], q: [90, 2, 6],
        note: 'No classes here: the label is any number, so this is <b>regression</b>.' },
    };
    el.innerHTML = `<p class="wgt">Try it: what is the label?</p>
      <div class="wgrow" id="w-fl-tabs"><button type="button" class="seg2 on" data-k="Class">Label is a class (iris)</button><button type="button" class="seg2" data-k="Number">Label is a number</button></div>
      <div class="fltab" id="w-fl"></div><p class="wgsay" id="w-flnote"></p>`;
    const paint = k => {
      const s = sets[k], n = s.fh.length, g = `style="grid-template-columns:repeat(${n + 1},minmax(74px,1fr))"`;
      $$('#w-fl-tabs button').forEach(b => b.classList.toggle('on', b.dataset.k === k));
      const head = `<div class="flr flg" ${g}><span class="flb" style="grid-column:span ${n}">Features (the inputs)</span><span class="flb">Label (the answer)</span></div>
        <div class="flr flh" ${g}>${s.fh.map(h => `<span>${h}</span>`).join('')}<span>${s.lh}</span></div>`;
      const rows = s.rows.map(r => `<div class="flr fd" ${g}>${r.map((v, i) => `<span>${typeof v === 'number' && k === 'Class' ? v.toFixed(1) : v}</span>`).join('')}</div>`).join('');
      const q = `<div class="flr fd flq" ${g}>${s.q.map(v => `<span>${k === 'Class' ? v.toFixed(1) : v}</span>`).join('')}<span>?</span></div>`;
      $('#w-fl').innerHTML = head + rows + q;
      $('#w-flnote').innerHTML = s.note + ' The last row is a new example: the model sees only the features and must guess the label.';
    };
    $('#w-fl-tabs').onclick = e => { const bt = e.target.closest('button'); if (bt) paint(bt.dataset.k); };
    paint('Class');
  },
  // regularization: one wiggly curve fitted with none / L1 / L2 / more data, curve + weights side by side
  regviz(el) {
    const D = 10, W = 320, H = 210, truth = x => Math.sin(2.4 * x);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const noise = () => (rnd() + rnd() + rnd() - 1.5) * 0.55;
    const mk = n => Array.from({ length: n }, (_, i) => { const x = -1 + 2 * (i + 0.5) / n + (rnd() - 0.5) * 0.06; return [x, truth(x) + noise()]; });
    const few = mk(12), many = mk(60), test = mk(80);
    const feat = x => Array.from({ length: D }, (_, k) => x ** k);
    const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
    const solve = (A, b) => { // gaussian elimination with pivoting
      const n = b.length, M = A.map((r, i) => [...r, b[i]]);
      for (let c = 0; c < n; c++) {
        let m = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[m][c])) m = r;
        [M[c], M[m]] = [M[m], M[c]];
        for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
      }
      const x = Array(n).fill(0);
      for (let r = n - 1; r >= 0; r--) x[r] = (M[r][n] - dot(M[r].slice(r + 1, n), x.slice(r + 1))) / M[r][r];
      return x;
    };
    const fit = (pts, kind, lam) => {
      const X = pts.map(p => feat(p[0])), y = pts.map(p => p[1]), n = pts.length;
      const G = Array.from({ length: D }, (_, i) => Array.from({ length: D }, (_, j) => X.reduce((s, r) => s + r[i] * r[j], 0) / n));
      const g = Array.from({ length: D }, (_, i) => X.reduce((s, r, k) => s + r[i] * y[k], 0) / n);
      if (kind !== 'L1') return solve(G.map((r, i) => r.map((v, j) => v + (i === j && i > 0 ? lam : 0) + (i === j ? 1e-9 : 0))), g);
      // L1: ISTA (gradient step, then shrink). ponytail: fixed 6000 steps, plenty for 10 weights
      let L = 1, v = Array(D).fill(1); for (let t = 0; t < 40; t++) { const u = G.map(r => dot(r, v)); L = Math.hypot(...u); v = u.map(a => a / L); }
      let wt = Array(D).fill(0);
      for (let t = 0; t < 6000; t++) {
        const gr = G.map((r, i) => dot(r, wt) - g[i]);
        wt = wt.map((a, i) => { const z = a - gr[i] / L; return i === 0 ? z : Math.sign(z) * Math.max(0, Math.abs(z) - lam / L); });
      }
      return wt;
    };
    const mse = (w, pts) => pts.reduce((s, p) => s + (dot(w, feat(p[0])) - p[1]) ** 2, 0) / pts.length;
    el.innerHTML = `<p class="wgt">Try it: tame a wiggly curve</p>
      <div class="wgrow wgctl" id="w-rg-tabs">${['None', 'L1', 'L2', 'Dropout', 'More data'].map((n, i) => `<button type="button" class="seg2${i ? '' : ' on'}" data-k="${n}">${n}</button>`).join('')}<label id="w-rg-lamrow">λ <input id="w-rg-lam" type="range" min="1" max="100" value="55" style="width:100px"><b class="wgv" id="w-rg-lamv"></b></label></div>
      <div class="tms" id="w-rg-desc" style="margin:22px 0 16px"></div>
      <div class="dropviz" id="w-rg-fig"></div><p class="wgsay" id="w-rg-say"></p><div id="w-rg-drop" hidden></div>`;
    let dropReady = false;
    let kind = 'None';
    const paint = () => {
      const lam = 10 ** (-4 + $('#w-rg-lam').value / 25);
      $$('#w-rg-tabs button').forEach(b => b.classList.toggle('on', b.dataset.k === kind));
      $('#w-rg-lamrow').style.display = kind === 'L1' || kind === 'L2' ? '' : 'none';
      const DESC = {"None": ["None", "No penalty on the weights. The model is free to fit the training data as tightly as it can, which is fine for simple problems but risky for complex ones, because it can memorise the noise and overfit."], "L1": ["L1 regularization (Lasso)", "Adds the sum of the absolute weight values to the loss. This pushes unimportant weights all the way to exactly zero, which effectively removes those connections. Useful when you want the model to keep only the features that matter."], "L2": ["L2 regularization (Ridge, weight decay)", "Adds the sum of the squared weight values to the loss. It keeps every weight small without forcing any of them to zero, so no single weight can dominate. The most common regularization, and the usual default."], "Dropout": ["Dropout", "Changes the network instead of the loss. At each training step, a random share of neurons (for example 50%) is switched off, so the network cannot lean on any single neuron and has to spread what it knows across many of them."], "More data": ["More (or artificially expanded) training data", "Gives the model more variety to learn from, so it has less room to memorise. When you cannot collect more, you can expand what you have, for example by slightly shifting, rotating or flipping the training images."]};
      $('#w-rg-desc').innerHTML = `<div class="tm"><b>${DESC[kind][0]}</b><span>${DESC[kind][1]}</span></div>`;
      const dp = kind === 'Dropout';
      $('#w-rg-drop').hidden = !dp; $('#w-rg-fig').hidden = dp; $('#w-rg-say').hidden = dp;
      if (dp) { if (!dropReady) { dropReady = true; widgets.dropoutdiagram($('#w-rg-drop')); } return; }
      $('#w-rg-lamv').textContent = lam.toPrecision(2);
      const pts = kind === 'More data' ? many : few, w = fit(pts, kind, kind === 'L1' || kind === 'L2' ? lam : 0);
      const px = x => 36 + (x + 1) / 2 * (W - 48), py = y => 10 + (1.7 - y) / 3.4 * (H - 36);
      const curve = Array.from({ length: 81 }, (_, i) => { const x = -1 + i / 40, y = Math.max(-1.7, Math.min(1.7, dot(w, feat(x)))); return `${px(x).toFixed(1)},${py(y).toFixed(1)}`; }).join(' ');
      const tr = Array.from({ length: 81 }, (_, i) => { const x = -1 + i / 40; return `${px(x).toFixed(1)},${py(truth(x)).toFixed(1)}`; }).join(' ');
      const dots = pts.map(p => `<circle cx="${px(p[0])}" cy="${py(p[1])}" r="3" fill="var(--peach)"/>`).join('');
      const fig1 = `<svg viewBox="0 0 ${W} ${H}" width="100%"><line x1="36" y1="${py(0)}" x2="${W - 12}" y2="${py(0)}" stroke="var(--s0)"/>
        <polyline points="${tr}" fill="none" stroke="var(--o0)" stroke-dasharray="4 4"/><polyline points="${curve}" fill="none" stroke="var(--mauve)" stroke-width="2"/>${dots}
        <text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="10" fill="var(--o1)">input (x)</text></svg>`;
      const mx = Math.max(...w.map(Math.abs)), bw = (W - 48) / D, zero = w.filter(a => Math.abs(a) < 1e-3).length;
      const bars = w.map((a, i) => { const h = Math.abs(a) / mx * (H - 70) / 2, x = 36 + i * bw, y0 = (H - 26) / 2 + 8;
        return `<rect x="${x + 3}" y="${a >= 0 ? y0 - h : y0}" width="${bw - 6}" height="${Math.max(1, h)}" rx="2" fill="var(--${a >= 0 ? 'blue' : 'red'})" opacity="${Math.abs(a) < 1e-3 ? .25 : 1}"/>
          <text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="9" fill="var(--o0)">w${i}</text>`; }).join('');
      const fig2 = `<svg viewBox="0 0 ${W} ${H}" width="100%"><line x1="36" y1="${(H - 26) / 2 + 8}" x2="${W - 12}" y2="${(H - 26) / 2 + 8}" stroke="var(--s1)"/>${bars}
        <text x="36" y="12" font-size="10" fill="var(--o1)">largest weight: ${mx.toFixed(mx < 10 ? 2 : 0)}</text></svg>`;
      $('#w-rg-fig').innerHTML = `<figure><figcaption>Fitted curve (dashed = the real pattern)</figcaption>${fig1}</figure><figure><figcaption>The 10 weights behind it</figcaption>${fig2}</figure>`;
      const say = { None: 'No penalty: the curve chases every dot, and a few huge weights do the work.', L1: `L1 tax: ${zero} of 10 weights are pushed to exactly zero. Raise λ and more switch off.`, L2: 'L2 tax: every weight shrinks, none hits exactly zero. Raise λ and the curve gets stiffer.', 'More data': `Same model, ${many.length} dots instead of ${few.length}: the curve settles on the real pattern with no penalty at all.` }[kind];
      $('#w-rg-say').innerHTML = `${say} Error on dots it trained on: <b>${mse(w, pts).toFixed(3)}</b>. Error on 80 new dots: <b>${mse(w, test).toFixed(3)}</b>.`;
    };
    $('#w-rg-tabs').onclick = e => { const b = e.target.closest('button'); if (b) { kind = b.dataset.k; paint(); } };
    $('#w-rg-lam').oninput = paint;
    paint();
  },
  // an 8 x 8 greyscale image as a grid of numbers: click a pixel to change its brightness
  pixelgrid(el) {
    const art = ['00111100', '01000010', '10100101', '10000001', '10100101', '10011001', '01000010', '00111100'];
    const px = art.flatMap(r => [...r].map(c => (c === '1' ? 0 : 255)));
    el.innerHTML = `<p class="wgt">Try it: click a pixel to change its number</p>
      <div class="pxg" id="w-px"></div><p class="wgsay" id="w-px-say"></p>`;
    const paint = () => {
      $('#w-px').innerHTML = px.map((v, i) => `<button type="button" class="pxc" data-i="${i}" style="background:rgb(${v},${v},${v});color:${v > 127 ? '#111' : '#eee'}">${v}</button>`).join('');
      $('#w-px-say').innerHTML = `This picture is <b>8 × 8 = 64 numbers</b>: <code>img.shape = (8, 8)</code>. 0 is black, 255 is white. A colour picture of the same size needs 3 numbers per pixel, <code>(8, 8, 3)</code>, which is 192.`;
    };
    $('#w-px').onclick = e => { const b = e.target.closest('.pxc'); if (b) { const i = +b.dataset.i; px[i] = px[i] >= 255 ? 0 : Math.min(255, px[i] + 64); paint(); } };
    el._reset = () => { art.flatMap(r => [...r].map(c => (c === '1' ? 0 : 255))).forEach((v, i) => px[i] = v); paint(); };
    paint();
  },
  // OpenCV stores colour as (B, G, R); show what a mix means and what you get if the order is mixed up
  bgrmix(el) {
    el.innerHTML = `<p class="wgt">Try it: mix a colour the OpenCV way</p>
      <div class="wgrow"><label>B <input id="w-bg-b" type="range" min="0" max="255" value="40"></label><label>G <input id="w-bg-g" type="range" min="0" max="255" value="160"></label><label>R <input id="w-bg-r" type="range" min="0" max="255" value="240"></label></div>
      <div class="dropviz"><figure><figcaption>What <code id="w-bg-t"></code> means in OpenCV</figcaption><div class="sw" id="w-bg-1"></div></figure>
      <figure><figcaption>What you see if you hand it to matplotlib without converting</figcaption><div class="sw" id="w-bg-2"></div></figure></div>
      <p class="wgsay">Red and blue trade places in the second box. That is the "blue skin" bug: <code>cv.cvtColor(img, cv.COLOR_BGR2RGB)</code> fixes it.</p>`;
    const run = () => {
      const b = +$('#w-bg-b').value, g = +$('#w-bg-g').value, r = +$('#w-bg-r').value;
      $('#w-bg-t').textContent = `(${b}, ${g}, ${r})`;
      $('#w-bg-1').style.background = `rgb(${r},${g},${b})`;
      $('#w-bg-2').style.background = `rgb(${b},${g},${r})`;
    };
    el.addEventListener('input', run); run();
  },
  // crop / flip / resize on a drawn scene, with pixel coordinates on both pictures
  cropflip(el) {
    const W = 240, H = 160, OX = 36, OY = 24, CW = W + OX + 12, CH = H + OY + 14;
    const scene = ctx => {
      ctx.fillStyle = '#8fc7f2'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#6fbf73'; ctx.fillRect(0, 115, W, 45);
      ctx.fillStyle = '#f7d154'; ctx.beginPath(); ctx.arc(195, 35, 18, 0, 7); ctx.fill();
      ctx.fillStyle = '#d9534f'; ctx.fillRect(40, 70, 70, 55);
      ctx.fillStyle = '#7a4a2b'; ctx.beginPath(); ctx.moveTo(32, 72); ctx.lineTo(75, 38); ctx.lineTo(118, 72); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(66, 92, 18, 33);
      ctx.font = '700 12px sans-serif'; ctx.fillStyle = '#111'; ctx.fillText('CV', 150, 100);
    };
    // pixel numbers along the top (x) and left (y) edges of a picture w x h, and a green dot on its (0, 0)
    const axes = (g, w, h) => {
      g.font = '10px sans-serif'; g.fillStyle = '#a6adc8'; g.strokeStyle = '#585b70'; g.lineWidth = 1;
      const xs = [0, w / 2, w].map(Math.round), ys = [0, h / 2, h].map(Math.round);
      xs.forEach((x, i) => { g.textAlign = i === 0 ? 'left' : i === 2 ? 'right' : 'center'; g.fillText(x, OX + x, OY - 8); g.beginPath(); g.moveTo(OX + x + .5, OY - 5); g.lineTo(OX + x + .5, OY); g.stroke(); });
      g.textAlign = 'right';
      ys.forEach(y => { g.fillText(y, OX - 8, OY + y + 3); g.beginPath(); g.moveTo(OX - 5, OY + y + .5); g.lineTo(OX, OY + y + .5); g.stroke(); });
      g.fillStyle = '#a6e3a1'; g.beginPath(); g.arc(OX, OY, 3.5, 0, 7); g.fill();
      g.fillStyle = '#89b4fa'; g.textAlign = 'left'; g.fillText('x', OX + w + 6, OY - 8); g.fillStyle = '#f38ba8'; g.textAlign = 'right'; g.fillText('y', OX - 8, OY + h + 16);
    };
    el.innerHTML = `<p class="wgt">Try it: pick an operation</p>
      <div class="wgrow" id="w-cf-tabs">${['Crop', 'Flip 0', 'Flip 1', 'Flip -1', 'Resize'].map((n, i) => `<button type="button" class="seg2${i ? '' : ' on'}" data-k="${n}">${n}</button>`).join('')}</div>
      <div class="wgrow" id="w-cf-sl"><label>y1 <input id="w-cf-y1" type="range" min="0" max="${H - 10}" value="30"></label><label>y2 <input id="w-cf-y2" type="range" min="10" max="${H}" value="130"></label><label>x1 <input id="w-cf-x1" type="range" min="0" max="${W - 10}" value="30"></label><label>x2 <input id="w-cf-x2" type="range" min="10" max="${W}" value="130"></label></div>
      <div class="dropviz"><figure><figcaption>Original (${W} × ${H}), with its pixel coordinates</figcaption><canvas id="w-cf-a" width="${CW}" height="${CH}"></canvas></figure><figure><figcaption id="w-cf-cap">Result</figcaption><canvas id="w-cf-b" width="${CW}" height="${CH}"></canvas></figure></div>
      <p class="wgsay"><code id="w-cf-code"></code></p>`;
    let k = 'Crop';
    const run = () => {
      const a = $('#w-cf-a').getContext('2d'), b = $('#w-cf-b').getContext('2d');
      let y1 = +$('#w-cf-y1').value, y2 = +$('#w-cf-y2').value, x1 = +$('#w-cf-x1').value, x2 = +$('#w-cf-x2').value;
      if (y2 <= y1) y2 = y1 + 1; if (x2 <= x1) x2 = x1 + 1;
      $$('#w-cf-tabs button').forEach(bt => bt.classList.toggle('on', bt.dataset.k === k));
      $('#w-cf-sl').hidden = k !== 'Crop';
      const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; scene(tmp.getContext('2d'));
      a.setTransform(1, 0, 0, 1, 0, 0); a.fillStyle = '#11111b'; a.fillRect(0, 0, CW, CH); a.drawImage(tmp, OX, OY); axes(a, W, H);
      if (k === 'Crop') {
        a.strokeStyle = '#e64553'; a.lineWidth = 2; a.strokeRect(OX + x1, OY + y1, x2 - x1, y2 - y1);
        a.font = '700 10px sans-serif'; a.fillStyle = 'rgba(17,17,27,.85)'; a.fillRect(OX + x1, OY + y1 - 12 < OY ? OY + y1 : OY + y1 - 12, 52, 12); a.fillRect(OX + x2 - 52, OY + y2 + 12 > OY + H ? OY + y2 - 12 : OY + y2, 52, 12);
        a.fillStyle = '#f38ba8'; a.textAlign = 'left'; a.fillText(`(${x1}, ${y1})`, OX + x1 + 3, (OY + y1 - 12 < OY ? OY + y1 : OY + y1 - 12) + 10);
        a.textAlign = 'right'; a.fillText(`(${x2}, ${y2})`, OX + x2 - 3, (OY + y2 + 12 > OY + H ? OY + y2 - 12 : OY + y2) + 10);
      }
      b.setTransform(1, 0, 0, 1, 0, 0); b.fillStyle = '#11111b'; b.fillRect(0, 0, CW, CH);
      let code, cap, rw = W, rh = H;
      if (k === 'Crop') { rw = x2 - x1; rh = y2 - y1; b.drawImage(tmp, x1, y1, rw, rh, OX, OY, rw, rh); code = `cropped = img[${y1}:${y2}, ${x1}:${x2}]   # [y1:y2, x1:x2] -> ${rh} tall, ${rw} wide`; cap = `Cropped (${rw} × ${rh}): its own (0, 0) is the old (${x1}, ${y1})`; }
      else if (k === 'Resize') { rw = W / 2; rh = H / 2; b.drawImage(tmp, OX, OY, rw, rh); code = `cv.resize(img, (${rw}, ${rh}), interpolation=cv.INTER_AREA)   # dsize is (width, height)`; cap = `Resized (${rw} × ${rh})`; }
      else { const c = +k.split(' ')[1]; b.setTransform(c === 0 ? 1 : -1, 0, 0, c === 1 ? 1 : -1, c === 0 ? OX : OX + W, c === 1 ? OY : OY + H); if (c === 0) b.setTransform(1, 0, 0, -1, OX, OY + H); b.drawImage(tmp, 0, 0); b.setTransform(1, 0, 0, 1, 0, 0); code = `cv.flip(img, ${c})   # ${c === 0 ? 'upside down' : c === 1 ? 'mirror left-right' : 'both axes'}`; cap = 'Flipped (still the same size)'; }
      b.setTransform(1, 0, 0, 1, 0, 0); axes(b, rw, rh);
      $('#w-cf-cap').textContent = cap; $('#w-cf-code').textContent = code;
    };
    $('#w-cf-tabs').onclick = e => { const bt = e.target.closest('button'); if (bt) { k = bt.dataset.k; run(); } };
    el.addEventListener('input', run); run();
  },
  // HSV colour mask: choose a hue range and see which pixels survive, like cv.inRange
  hsvmask(el) {
    const W = 240, H = 130;
    const cols = [[0, 'red'], [15, 'orange'], [30, 'yellow'], [60, 'green'], [90, 'cyan'], [120, 'blue'], [150, 'purple'], [0, 'white']];
    const hsv2rgb = (h, s, v) => { const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c; const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return [(r + m) * 255, (g + m) * 255, (b + m) * 255].map(Math.round); };
    // build the picture once as HSV (OpenCV scale: H 0-179, S and V 0-255)
    const img = []; const cx = i => 32 + (i % 4) * 58, cy = i => 34 + Math.floor(i / 4) * 62;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let px = [0, 0, 40];
      cols.forEach(([h], i) => { if ((x - cx(i)) ** 2 + (y - cy(i)) ** 2 < 24 * 24) px = i === 7 ? [0, 12, 245] : [h, 230, 235]; });
      img.push(px);
    }
    el.innerHTML = `<p class="wgt">Try it: keep only some colours</p>
      <div class="hbar" id="w-hs-bar"></div>
      <div class="wgrow"><label>H low <input id="w-hs-l" type="range" min="0" max="179" value="35"></label><label>H high <input id="w-hs-h" type="range" min="0" max="179" value="85"></label><label>S min <input id="w-hs-s" type="range" min="0" max="255" value="50"></label><label>V min <input id="w-hs-v" type="range" min="0" max="255" value="50"></label></div>
      <div class="dropviz"><figure><figcaption>Original</figcaption><canvas id="w-hs-a" width="${W}" height="${H}"></canvas></figure><figure><figcaption>Mask (white = kept)</figcaption><canvas id="w-hs-b" width="${W}" height="${H}"></canvas></figure><figure><figcaption>Result</figcaption><canvas id="w-hs-c" width="${W}" height="${H}"></canvas></figure></div>
      <p class="wgsay"><code id="w-hs-code"></code></p>`;
    $('#w-hs-bar').style.background = `linear-gradient(90deg,${Array.from({ length: 13 }, (_, i) => `rgb(${hsv2rgb(i * 15, 1, 1)})`).join(',')})`;
    const run = () => {
      const lo = +$('#w-hs-l').value, hi = +$('#w-hs-h').value, sm = +$('#w-hs-s').value, vm = +$('#w-hs-v').value;
      const A = $('#w-hs-a').getContext('2d'), B = $('#w-hs-b').getContext('2d'), C = $('#w-hs-c').getContext('2d');
      const da = A.createImageData(W, H), db = B.createImageData(W, H), dc = C.createImageData(W, H);
      img.forEach(([h, s, v], i) => {
        const rgb = hsv2rgb(h * 2, s / 255, v / 255), on = h >= lo && h <= hi && s >= sm && v >= vm;
        [0, 1, 2].forEach(k => { da.data[i * 4 + k] = rgb[k]; db.data[i * 4 + k] = on ? 255 : 0; dc.data[i * 4 + k] = on ? rgb[k] : 0; });
        da.data[i * 4 + 3] = db.data[i * 4 + 3] = dc.data[i * 4 + 3] = 255;
      });
      A.putImageData(da, 0, 0); B.putImageData(db, 0, 0); C.putImageData(dc, 0, 0);
      $('#w-hs-code').textContent = `mask = cv.inRange(hsv, np.array([${lo}, ${sm}, ${vm}]), np.array([${hi}, 255, 255]))`;
    };
    el.addEventListener('input', run); run();
  },
  // mouse events: move and click over a canvas, see the (event, x, y) a callback would get
  mouseclick(el) {
    const W = 320, H = 170;
    el.innerHTML = `<p class="wgt">Try it: move and click on the picture</p>
      <canvas id="w-mc" width="${W}" height="${H}" style="cursor:crosshair"></canvas>
      <p class="wgsay"><code id="w-mc-now">cv.EVENT_MOUSEMOVE  x, y = ...</code></p>
      <div class="evlog" id="w-mc-log"></div>`;
    const cv = $('#w-mc'), g = cv.getContext('2d'), dots = [], log = [];
    const draw = () => {
      g.fillStyle = '#181825'; g.fillRect(0, 0, W, H); g.strokeStyle = '#313244'; g.lineWidth = 1;
      for (let x = 0; x <= W; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = 0; y <= H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.fillStyle = '#585b70'; g.font = '10px sans-serif'; g.fillText('(0, 0) top-left', 6, 12);
      dots.forEach(d => { g.fillStyle = d.c; g.beginPath(); g.arc(d.x, d.y, 6, 0, 7); g.fill(); });
    };
    const pos = e => { const r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) * W / r.width), Math.round((e.clientY - r.top) * H / r.height)]; };
    const add = t => { log.unshift(t); log.length = Math.min(log.length, 5); $('#w-mc-log').innerHTML = log.map(l => `<div>${l}</div>`).join(''); };
    cv.onmousemove = e => { const [x, y] = pos(e); $('#w-mc-now').textContent = `cv.EVENT_MOUSEMOVE   x, y = ${x}, ${y}`; };
    cv.onmousedown = e => { const [x, y] = pos(e), right = e.button === 2; dots.push({ x, y, c: right ? '#f38ba8' : '#a6e3a1' }); draw(); add(`${right ? 'EVENT_RBUTTONDOWN' : 'EVENT_LBUTTONDOWN'} at (${x}, ${y})  -> circle drawn`); };
    cv.oncontextmenu = e => e.preventDefault();
    cv.onmouseup = e => { const [x, y] = pos(e); add(`${e.button === 2 ? 'EVENT_RBUTTONUP' : 'EVENT_LBUTTONUP'} at (${x}, ${y})`); };
    el._reset = () => { dots.length = 0; log.length = 0; draw(); add('waiting for the mouse...'); };
    draw(); add('waiting for the mouse...');
  },
  // threshold: every pixel is compared with one cut-off value
  threshold(el) {
    const W = 240, H = 140, types = ['BINARY', 'BINARY_INV', 'TRUNC', 'TOZERO', 'TOZERO_INV'];
    const gray = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let v = Math.round(x / W * 200 + 20);
      if ((x - 70) ** 2 + (y - 70) ** 2 < 40 * 40) v = 90;
      if (x > 120 && x < 190 && y > 25 && y < 115) v = 175;
      if (x > 200 && y > 100) v = 245;
      gray[y * W + x] = v;
    }
    const apply = (v, t, k) => { const hi = v > t; return k === 'BINARY' ? (hi ? 255 : 0) : k === 'BINARY_INV' ? (hi ? 0 : 255) : k === 'TRUNC' ? (hi ? t : v) : k === 'TOZERO' ? (hi ? v : 0) : (hi ? 0 : v); };
    el.innerHTML = `<p class="wgt">Try it: pick a rule and a cut-off</p>
      <div class="wgrow" id="w-th-tabs">${types.map((n, i) => `<button type="button" class="seg2${i ? '' : ' on'}" data-k="${n}">${n.toLowerCase().replace('tozero', 'to zero').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase())}</button>`).join('')}</div>
      <div class="wgrow"><label>thresh <input id="w-th-t" type="range" min="0" max="255" value="150"></label><b id="w-th-v">150</b></div>
      <div class="dropviz"><figure><figcaption>Grayscale image</figcaption><canvas id="w-th-a" width="${W}" height="${H}"></canvas></figure><figure><figcaption>Result</figcaption><canvas id="w-th-b" width="${W}" height="${H}"></canvas></figure></div>
      <p class="wgsay"><code id="w-th-code"></code></p><p class="wgsay" id="w-th-say"></p>`;
    let k = 'BINARY';
    const run = () => {
      const t = +$('#w-th-t').value; $('#w-th-v').textContent = t;
      $$('#w-th-tabs button').forEach(b => b.classList.toggle('on', b.dataset.k === k));
      const A = $('#w-th-a').getContext('2d'), B = $('#w-th-b').getContext('2d'), da = A.createImageData(W, H), db = B.createImageData(W, H);
      gray.forEach((v, i) => { const r = apply(v, t, k); [0, 1, 2].forEach(c => { da.data[i * 4 + c] = v; db.data[i * 4 + c] = r; }); da.data[i * 4 + 3] = db.data[i * 4 + 3] = 255; });
      A.putImageData(da, 0, 0); B.putImageData(db, 0, 0);
      $('#w-th-code').textContent = `ret, dst = cv.threshold(gray, ${t}, 255, cv.THRESH_${k})`;
      $('#w-th-say').innerHTML = 'Pixel by pixel: ' + [10, 90, 150, 151, 200, 255].map(v => `${v} &rarr; <b>${apply(v, t, k)}</b>`).join(', ');
    };
    $('#w-th-tabs').onclick = e => { const b = e.target.closest('button'); if (b) { k = b.dataset.k; run(); } };
    $('#w-th-t').oninput = run; run();
  },
  // edges: gradient strength (like Sobel/Canny), with and without a blur first
  edgeviz(el) {
    const W = 200, H = 130; let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const base = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let v = 60; if ((x - 60) ** 2 + (y - 65) ** 2 < 38 * 38) v = 200; if (x > 110 && x < 175 && y > 25 && y < 100) v = 140;
      base[y * W + x] = v + (rnd() - 0.5) * 70;
    }
    const blurred = (src) => { const o = new Float32Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0, n = 0; for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const xx = x + i, yy = y + j; if (xx >= 0 && yy >= 0 && xx < W && yy < H) { s += src[yy * W + xx]; n++; } } o[y * W + x] = s / n; } return o; };
    const soft = blurred(base);
    el.innerHTML = `<p class="wgt">Try it: find the edges</p>
      <div class="wgrow" id="w-ed-tabs"><button type="button" class="seg2 on" data-k="0">No blur</button><button type="button" class="seg2" data-k="1">Blur first</button></div>
      <div class="wgrow"><label>Edge strength cut-off <input id="w-ed-t" type="range" min="20" max="400" value="140"></label><b id="w-ed-v">140</b></div>
      <div class="dropviz"><figure><figcaption>Grayscale (a little noise)</figcaption><canvas id="w-ed-a" width="${W}" height="${H}"></canvas></figure><figure><figcaption>Edges found</figcaption><canvas id="w-ed-b" width="${W}" height="${H}"></canvas></figure></div>
      <p class="wgsay" id="w-ed-say"></p>`;
    let on = 0;
    const run = () => {
      const t = +$('#w-ed-t').value; $('#w-ed-v').textContent = t;
      $$('#w-ed-tabs button').forEach(b => b.classList.toggle('on', +b.dataset.k === on));
      const src = on ? soft : base, A = $('#w-ed-a').getContext('2d'), B = $('#w-ed-b').getContext('2d'), da = A.createImageData(W, H), db = B.createImageData(W, H);
      let n = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, v = Math.max(0, Math.min(255, src[i]));
        let m = 0;
        if (x > 0 && y > 0 && x < W - 1 && y < H - 1) {
          const gx = -src[i - W - 1] - 2 * src[i - 1] - src[i + W - 1] + src[i - W + 1] + 2 * src[i + 1] + src[i + W + 1];
          const gy = -src[i - W - 1] - 2 * src[i - W] - src[i - W + 1] + src[i + W - 1] + 2 * src[i + W] + src[i + W + 1];
          m = Math.hypot(gx, gy);
        }
        const e = m > t ? 255 : 0; n += e ? 1 : 0;
        [0, 1, 2].forEach(c => { da.data[i * 4 + c] = v; db.data[i * 4 + c] = e; }); da.data[i * 4 + 3] = db.data[i * 4 + 3] = 255;
      }
      A.putImageData(da, 0, 0); B.putImageData(db, 0, 0);
      $('#w-ed-say').innerHTML = `${n} edge pixels. ${on ? 'The blur smoothed the noise away, so mostly the real outlines are left.' : 'Without a blur, the noise makes lots of tiny fake edges. Raise the cut-off, or turn the blur on.'}`;
    };
    $('#w-ed-tabs').onclick = e => { const b = e.target.closest('button'); if (b) { on = +b.dataset.k; run(); } };
    $('#w-ed-t').oninput = run; run();
  },
  // contours: trace the outline of each white shape; RETR_EXTERNAL vs RETR_LIST on a shape with a hole
  contourviz(el) {
    const W = 100, H = 64, S = 3, fg = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const donut = (x - 28) ** 2 + (y - 32) ** 2 < 22 * 22 && (x - 28) ** 2 + (y - 32) ** 2 > 10 * 10;
      const rect = x > 58 && x < 90 && y > 8 && y < 30;
      const dot = (x - 74) ** 2 + (y - 48) ** 2 < 9 * 9;
      fg[y * W + x] = donut || rect || dot ? 1 : 0;
    }
    const lab = (val, diag) => { const L = new Int32Array(W * H).fill(-1); let n = 0; for (let s = 0; s < W * H; s++) { if (fg[s] !== val || L[s] >= 0) continue; const st = [s]; L[s] = n; while (st.length) { const c = st.pop(), cx = c % W, cy = (c / W) | 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { if (!(i || j) || (!diag && i && j)) continue; const xx = cx + i, yy = cy + j; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const q = yy * W + xx; if (fg[q] === val && L[q] < 0) { L[q] = n; st.push(q); } } } n++; } return [L, n]; };
    const [FL, nf] = lab(1, true), [BL, nb] = lab(0, false), outside = BL[0];
    el.innerHTML = `<p class="wgt">Try it: how many contours?</p>
      <div class="wgrow" id="w-ct-tabs"><button type="button" class="seg2 on" data-k="EXTERNAL">External only</button><button type="button" class="seg2" data-k="LIST">List all</button></div>
      <div class="dropviz"><figure><figcaption>Binary image (white shapes)</figcaption><canvas id="w-ct-a" width="${W * S}" height="${H * S}"></canvas></figure><figure><figcaption>Contours drawn</figcaption><canvas id="w-ct-b" width="${W * S}" height="${H * S}"></canvas></figure></div>
      <p class="wgsay"><code id="w-ct-code"></code></p><p class="wgsay" id="w-ct-say"></p>`;
    let k = 'EXTERNAL';
    const pal = ['#f38ba8', '#a6e3a1', '#89b4fa', '#f9e2af', '#cba6f7', '#94e2d5'];
    const run = () => {
      $$('#w-ct-tabs button').forEach(b => b.classList.toggle('on', b.dataset.k === k));
      const A = $('#w-ct-a').getContext('2d'), B = $('#w-ct-b').getContext('2d'); A.fillStyle = '#000'; A.fillRect(0, 0, W * S, H * S); B.fillStyle = '#000'; B.fillRect(0, 0, W * S, H * S);
      A.fillStyle = '#fff'; const keys = new Map();
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x; if (!fg[i]) continue; A.fillRect(x * S, y * S, S, S);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const xx = x + dx, yy = y + dy, q = yy * W + xx; const bg = xx < 0 || yy < 0 || xx >= W || yy >= H ? outside : (fg[q] ? -1 : BL[q]);
          if (bg < 0 || (k === 'EXTERNAL' && bg !== outside)) return;
          const key = FL[i] + '-' + bg; if (!keys.has(key)) keys.set(key, keys.size);
          B.fillStyle = pal[keys.get(key) % pal.length]; B.fillRect(x * S, y * S, S, S);
        });
      }
      $('#w-ct-code').textContent = `contours, _ = cv.findContours(thresh, cv.RETR_${k}, cv.CHAIN_APPROX_SIMPLE)`;
      $('#w-ct-say').innerHTML = `<b>${keys.size}</b> contour${keys.size === 1 ? '' : 's'} found. ${k === 'EXTERNAL' ? 'Only the outermost outline of each shape counts, so the ring gives one.' : 'Every boundary counts, so the ring gives two: its outside edge and the edge of its hole.'}`;
    };
    $('#w-ct-tabs').onclick = e => { const b = e.target.closest('button'); if (b) { k = b.dataset.k; run(); } };
    run();
  },
  // bitwise operations on two shapes, and masking a picture
  bitwiseviz(el) {
    const S = 150, ops = ['AND', 'OR', 'XOR', 'NOT', 'Mask'];
    const R = (x, y) => x > 15 && x < 115 && y > 15 && y < 115, C = (x, y) => (x - 100) ** 2 + (y - 100) ** 2 < 55 * 55;
    const scene = (x, y) => (y > 105 ? [111, 191, 115] : (x - 40) ** 2 + (y - 35) ** 2 < 15 * 15 ? [247, 209, 84] : x > 60 && x < 130 && y > 60 ? [217, 83, 79] : [143, 199, 242]);
    el.innerHTML = `<p class="wgt">Try it: combine two shapes</p>
      <div class="wgrow" id="w-bw-tabs">${ops.map((n, i) => `<button type="button" class="seg2${i ? '' : ' on'}" data-k="${n}">${n.charAt(0) + n.slice(1).toLowerCase()}</button>`).join('')}</div>
      <div class="dropviz"><figure><figcaption id="w-bw-c1">Rectangle</figcaption><canvas id="w-bw-a" width="${S}" height="${S}"></canvas></figure><figure><figcaption id="w-bw-c2">Circle</figcaption><canvas id="w-bw-b" width="${S}" height="${S}"></canvas></figure><figure><figcaption>Result</figcaption><canvas id="w-bw-r" width="${S}" height="${S}"></canvas></figure></div>
      <p class="wgsay"><code id="w-bw-code"></code></p><p class="wgsay" id="w-bw-say"></p>`;
    let k = 'AND';
    const paint = (id, f) => { const g = $(id).getContext('2d'), d = g.createImageData(S, S); for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const c = f(x, y), i = (y * S + x) * 4; d.data[i] = c[0]; d.data[i + 1] = c[1]; d.data[i + 2] = c[2]; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); };
    const bw = v => (v ? [255, 255, 255] : [0, 0, 0]);
    const run = () => {
      $$('#w-bw-tabs button').forEach(b => b.classList.toggle('on', b.dataset.k === k));
      const mask = k === 'Mask';
      $('#w-bw-c1').textContent = mask ? 'Picture' : 'Rectangle'; $('#w-bw-c2').textContent = mask ? 'Mask (circle)' : 'Circle';
      paint('#w-bw-a', (x, y) => mask ? scene(x, y) : bw(R(x, y))); paint('#w-bw-b', (x, y) => bw(C(x, y)));
      const f = { AND: (x, y) => R(x, y) && C(x, y), OR: (x, y) => R(x, y) || C(x, y), XOR: (x, y) => R(x, y) !== C(x, y), NOT: (x, y) => !R(x, y) }[k];
      paint('#w-bw-r', (x, y) => mask ? (C(x, y) ? scene(x, y) : [0, 0, 0]) : bw(f(x, y)));
      $('#w-bw-code').textContent = { AND: 'cv.bitwise_and(rectangle, circle)', OR: 'cv.bitwise_or(rectangle, circle)', XOR: 'cv.bitwise_xor(rectangle, circle)', NOT: 'cv.bitwise_not(rectangle)', Mask: 'cv.bitwise_and(img, img, mask=circle)' }[k];
      $('#w-bw-say').textContent = { AND: 'White only where both shapes are white: the overlap.', OR: 'White where either shape is white: both shapes joined.', XOR: 'White only where they differ: one shape but not both.', NOT: 'Every pixel flipped: white becomes black and black becomes white.', Mask: 'The picture survives only where the mask is white. Everything else turns black.' }[k];
    };
    $('#w-bw-tabs').onclick = e => { const b = e.target.closest('button'); if (b) { k = b.dataset.k; run(); } };
    run();
  },
  // a Haar feature on a 20 x 20 pixel face patch: light pixels minus dark pixels
  haarfeature(el) {
    const N = 20, S = 12;
    const px = (x, y) => { let v = 170; if (y < 5) v = 205; if (y >= 6 && y <= 8 && ((x >= 3 && x <= 7) || (x >= 12 && x <= 16))) v = 55; if (x >= 9 && x <= 10 && y >= 6 && y <= 12) v = 195; if (y >= 9 && y <= 13 && (x < 4 || x > 15)) v = 185; if (y >= 15 && y <= 16 && x >= 6 && x <= 13) v = 70; if (y >= 18) v = 150; if (x < 1 || x > 18) v = 90; return v; };
    const types = { Edge: { w: 3, h: 2, rects: (u, w, h) => [[0, 0, w, h / 2, 1], [0, h / 2, w, h / 2, 0]] },
      'Edge |': { w: 2, h: 3, rects: (u, w, h) => [[0, 0, w / 2, h, 1], [w / 2, 0, w / 2, h, 0]] },
      Line: { w: 3, h: 2, rects: (u, w, h) => [[0, 0, u, h, 1], [u, 0, u, h, 0], [2 * u, 0, u, h, 1]] },
      Four: { w: 2, h: 2, rects: (u, w, h) => [[0, 0, u, u, 1], [u, 0, u, u, 0], [0, u, u, u, 0], [u, u, u, u, 1]] } };
    el.innerHTML = `<p class="wgt">Try it: slide a Haar feature over the face</p>
      <div class="wgrow" id="w-hf-tabs">${Object.keys(types).map((n, i) => `<button type="button" class="seg2${i ? '' : ' on'}" data-k="${n}">${n}</button>`).join('')}</div>
      <div class="wgrow"><label>x <input id="w-hf-x" type="range" min="0" max="19" value="3"></label><label>y <input id="w-hf-y" type="range" min="0" max="19" value="3"></label><label>size <input id="w-hf-u" type="range" min="1" max="6" value="3"></label></div>
      <canvas id="w-hf" width="${N * S}" height="${N * S}"></canvas>
      <p class="wgsay" id="w-hf-say"></p>`;
    let k = 'Edge';
    const run = () => {
      $$('#w-hf-tabs button').forEach(bt => bt.classList.toggle('on', bt.dataset.k === k));
      const t = types[k], u = +$('#w-hf-u').value, w = t.w * u, h = t.h * u;
      const x0 = Math.min(+$('#w-hf-x').value, N - w), y0 = Math.min(+$('#w-hf-y').value, N - h);
      const g = $('#w-hf').getContext('2d');
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = px(x, y); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x * S, y * S, S, S); }
      let sl = 0, nl = 0, sd = 0, nd = 0;
      t.rects(u, w, h).forEach(([rx, ry, rw, rh, light]) => {
        for (let y = 0; y < rh; y++) for (let x = 0; x < rw; x++) { const v = px(x0 + rx + x, y0 + ry + y); if (light) { sl += v; nl++; } else { sd += v; nd++; } }
        g.fillStyle = light ? 'rgba(166,227,161,.35)' : 'rgba(243,139,168,.35)'; g.fillRect((x0 + rx) * S, (y0 + ry) * S, rw * S, rh * S);
        g.strokeStyle = light ? '#a6e3a1' : '#f38ba8'; g.lineWidth = 2; g.strokeRect((x0 + rx) * S + 1, (y0 + ry) * S + 1, rw * S - 2, rh * S - 2);
      });
      const al = sl / nl, ad = sd / nd, d = al - ad, pass = d > 40;
      $('#w-hf-say').innerHTML = `Light (green) average <b>${al.toFixed(0)}</b>, dark (red) average <b>${ad.toFixed(0)}</b>. Feature value = light &minus; dark = <b>${d.toFixed(0)}</b>. ${pass ? 'A big positive gap: this test says "could be a face" and the window moves on to the next test.' : d < -40 ? 'A big gap, but the wrong way round: dark where a face should be light, so this test says no.' : 'The two areas look about the same here, so this test learns nothing.'} The start position puts the dark half over the eyes. Move it onto the forehead or the cheeks and the gap shrinks.`;
    };
    $('#w-hf-tabs').onclick = e => { const bt = e.target.closest('button'); if (bt) { k = bt.dataset.k; run(); } };
    el.addEventListener('input', run); run();
  },
  // Haar cascade: many overlapping hits around a real face, a few stray ones; scaleFactor and minNeighbors decide what survives
  haardiagram(el) {
    const W = 300, H = 200;
    const mk = (cx, cy, base, n, seed) => { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; return Array.from({ length: n }, () => [cx + (r() - .5) * 14, cy + (r() - .5) * 14, base * (0.9 + r() * 0.2)]); };
    const reals = mk(150, 105, 82, 22, 5), sa = mk(58, 52, 40, 6, 9), sb = mk(245, 158, 34, 3, 13);
    el.innerHTML = `<p class="wgt">Try it: scaleFactor and minNeighbors</p>
      <div class="wgrow"><label>scaleFactor <input id="w-hc-s" type="range" min="105" max="150" value="130"></label><b id="w-hc-sv">1.30</b><label>minNeighbors <input id="w-hc-n" type="range" min="0" max="20" value="5"></label><b id="w-hc-v">5</b></div>
      <div class="dropviz"><figure><figcaption>Detections on the picture</figcaption><canvas id="w-hc" width="${W}" height="${H}"></canvas></figure><figure><figcaption>Overlapping hits per spot (votes)</figcaption><svg id="w-hc-bars" viewBox="0 0 240 160" width="100%"></svg></figure></div>
      <p class="wgsay" id="w-hc-say"></p><p class="wgsay"><code id="w-hc-code"></code></p>`;
    const run = () => {
      const sf = +$('#w-hc-s').value / 100, n = +$('#w-hc-n').value; $('#w-hc-sv').textContent = sf.toFixed(2); $('#w-hc-v').textContent = n;
      const tries = Math.max(3, Math.min(22, Math.round(18 - (sf - 1.1) * 30))), scales = []; for (let s = 24; s < 180; s *= sf) scales.push(Math.round(s));
      const groups = [{ name: 'real face', hits: reals.slice(0, tries) }, { name: 'stray A', hits: sa.slice(0, Math.max(1, Math.round(tries * .23))) }, { name: 'stray B', hits: sb.slice(0, Math.max(1, Math.round(tries * .08))) }];
      const g = $('#w-hc').getContext('2d'); g.fillStyle = '#181825'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#f2cdcd'; g.beginPath(); g.ellipse(150, 105, 34, 42, 0, 0, 7); g.fill();
      g.fillStyle = '#11111b'; [[137, 95], [163, 95]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }); g.fillRect(140, 120, 20, 3);
      g.fillStyle = '#45475a'; g.beginPath(); g.arc(58, 52, 14, 0, 7); g.fill(); g.fillRect(238, 150, 14, 14);
      let kept = 0; g.font = '11px sans-serif';
      groups.forEach(gr => { const keep = gr.hits.length >= n; g.lineWidth = 1; g.strokeStyle = keep ? 'rgba(166,227,161,.3)' : 'rgba(243,139,168,.4)'; gr.hits.forEach(([cx, cy, s]) => g.strokeRect(cx - s / 2, cy - s / 2, s, s));
        const a = gr.hits.reduce((p, h) => [p[0] + h[0], p[1] + h[1], p[2] + h[2]], [0, 0, 0]).map(v => v / gr.hits.length);
        if (keep) { kept++; g.lineWidth = 2.5; g.strokeStyle = '#a6e3a1'; g.strokeRect(a[0] - a[2] / 2, a[1] - a[2] / 2, a[2], a[2]); }
        g.fillStyle = keep ? '#a6e3a1' : '#f38ba8'; g.fillText(`${gr.hits.length} hits`, Math.max(2, a[0] - a[2] / 2), Math.max(11, a[1] - a[2] / 2 - 4)); });
      const maxv = Math.max(22, n + 1), bw = 46, by = v => 130 - v / maxv * 112;
      $('#w-hc-bars').innerHTML = `<line x1="24" y1="130" x2="236" y2="130" stroke="var(--s1)"/>` + groups.map((gr, i) => { const v = gr.hits.length, keep = v >= n, x = 34 + i * 68; return `<rect x="${x}" y="${by(v)}" width="${bw}" height="${130 - by(v)}" rx="3" fill="var(--${keep ? 'green' : 'red'})" opacity=".85"/><text x="${x + bw / 2}" y="${by(v) - 4}" text-anchor="middle" font-size="11" fill="var(--text)">${v}</text><text x="${x + bw / 2}" y="146" text-anchor="middle" font-size="10" fill="var(--o1)">${gr.name}</text>`; }).join('')
        + `<line x1="24" y1="${by(n)}" x2="236" y2="${by(n)}" stroke="#f9e2af" stroke-width="2" stroke-dasharray="5 4"/><text x="236" y="${by(n) - 4}" text-anchor="end" font-size="10" fill="#f9e2af">minNeighbors = ${n}</text>`;
      const real = groups[0].hits.length >= n;
      $('#w-hc-say').innerHTML = `At scaleFactor ${sf.toFixed(2)} the window is tried at <b>${scales.length}</b> sizes (${scales.slice(0, 5).join(', ')}${scales.length > 5 ? ', ...' : ''} px). A smaller factor tries more sizes, so every spot collects more overlapping hits, but it runs slower. Bars at or above the dashed line survive: <b>${kept}</b> detection${kept === 1 ? '' : 's'} left. ${n <= 3 ? 'Too low: stray spots get through as false faces.' : real ? 'Just right: the real face has many hits, the strays do not.' : 'Too high: even the real face falls below the line.'}`;
      $('#w-hc-code').textContent = `faces = face_cascade.detectMultiScale(gray, ${sf.toFixed(2)}, ${n})`;
    };
    el.addEventListener('input', run); run();
  },
  // hand landmarks: 21 points, landmark 8 is the index fingertip; its x position drives a servo angle
  handlandmarks(el) {
    const W = 300, H = 230;
    const P = [[.5, .95], [.4, .86], [.32, .75], [.27, .64], [.22, .55], [.42, .62], [.41, .45], [.4, .33], [.4, .22], [.5, .6], [.5, .42], [.5, .29], [.5, .17], [.58, .62], [.59, .45], [.6, .33], [.6, .23], [.65, .68], [.68, .55], [.7, .46], [.71, .38]];
    const links = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];
    el.innerHTML = `<p class="wgt">Try it: move the index fingertip</p>
      <div class="wgrow"><label>Fingertip x (0 to 1) <input id="w-hl-x" type="range" min="0" max="100" value="40"></label><b id="w-hl-v"></b></div>
      <div class="dropviz"><figure><figcaption>21 landmarks (tip = number 8)</figcaption><svg id="w-hl-a" viewBox="0 0 ${W} ${H}" width="100%"></svg></figure><figure><figcaption>Servo angle</figcaption><svg id="w-hl-b" viewBox="0 0 220 150" width="100%"></svg></figure></div>
      <p class="wgsay" id="w-hl-say"></p>`;
    const run = () => {
      const tx = +$('#w-hl-x').value / 100, pts = P.map((p, i) => i === 8 ? [tx, p[1]] : p), ang = Math.round(tx * 180);
      $('#w-hl-v').textContent = tx.toFixed(2);
      const X = p => p[0] * W, Y = p => p[1] * H;
      $('#w-hl-a').innerHTML = links.map(([a, b]) => `<line x1="${X(pts[a])}" y1="${Y(pts[a])}" x2="${X(pts[b])}" y2="${Y(pts[b])}" stroke="var(--o0)" stroke-width="2"/>`).join('')
        + pts.map((p, i) => `<circle cx="${X(p)}" cy="${Y(p)}" r="${i === 8 ? 7 : 3.5}" fill="${i === 8 ? '#f38ba8' : '#cba6f7'}"/>`).join('')
        + `<text x="${X(pts[8]) + 10}" y="${Y(pts[8]) + 4}" font-size="11" fill="#f38ba8">8</text><text x="${X(pts[0]) + 8}" y="${Y(pts[0]) + 4}" font-size="11" fill="#a6adc8">0 wrist</text>`;
      const a = ang * Math.PI / 180, cx = 110, cy = 120;
      $('#w-hl-b').innerHTML = `<path d="M30 120 A80 80 0 0 1 190 120" fill="none" stroke="var(--s1)" stroke-width="6"/><line x1="${cx}" y1="${cy}" x2="${cx - 70 * Math.cos(a)}" y2="${cy - 70 * Math.sin(a)}" stroke="#a6e3a1" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="8" fill="#a6e3a1"/><text x="20" y="140" font-size="10" fill="#a6adc8">0&deg;</text><text x="176" y="140" font-size="10" fill="#a6adc8">180&deg;</text><text x="${cx}" y="22" text-anchor="middle" font-size="14" fill="#cdd6f4">${ang}&deg;</text>`;
      $('#w-hl-say').innerHTML = `The model gives x as a fraction of the frame width. On a 640-pixel frame that is pixel <b>${Math.round(tx * 640)}</b>, which maps to a servo angle of <b>${ang}&deg;</b>: <code>angle = int(tip.x * 180)</code>.`;
    };
    $('#w-hl-x').oninput = run; run();
  },
  // Gaussian blur: a weighted average whose weights form a bell curve; bigger kernel, blurrier picture
  gaussblur(el) {
    const W = 200, H = 120; let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const base = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 70; if ((x - 62) ** 2 + (y - 60) ** 2 < 36 * 36) v = 200; if (x > 120 && x < 180 && y > 25 && y < 95) v = 150; base[y * W + x] = Math.max(0, Math.min(255, v + (rnd() - 0.5) * 90)); }
    el.innerHTML = `<p class="wgt">Try it: blur the noise away</p>
      <div class="wgrow"><label>Kernel size <input id="w-gb-k" type="range" min="0" max="5" value="2"></label><b id="w-gb-v"></b></div>
      <div class="dropviz"><figure><figcaption>Noisy grayscale</figcaption><canvas id="w-gb-a" width="${W}" height="${H}"></canvas></figure><figure><figcaption>After GaussianBlur</figcaption><canvas id="w-gb-b" width="${W}" height="${H}"></canvas></figure><figure><figcaption>The kernel (weights)</figcaption><div class="kern" id="w-gb-k2"></div></figure></div>
      <p class="wgsay"><code id="w-gb-code"></code></p><p class="wgsay" id="w-gb-say"></p>`;
    const run = () => {
      const k = [1, 3, 5, 7, 9, 11][+$('#w-gb-k').value], r = (k - 1) / 2; $('#w-gb-v').textContent = `${k} × ${k}`;
      const sg = k === 1 ? 1 : 0.3 * ((k - 1) * 0.5 - 1) + 0.8; // OpenCV's default sigma from the kernel size
      const ker = []; let sum = 0; for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const v = Math.exp(-(i * i + j * j) / (2 * sg * sg)); ker.push(v); sum += v; }
      const kn = ker.map(v => v / sum), out = new Float32Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0, t = 0, n = 0; for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const xx = x + i, yy = y + j, w = kn[n++]; if (xx >= 0 && yy >= 0 && xx < W && yy < H) { s += base[yy * W + xx] * w; t += w; } } out[y * W + x] = s / t; }
      [['#w-gb-a', base], ['#w-gb-b', out]].forEach(([id, src]) => { const g = $(id).getContext('2d'), d = g.createImageData(W, H); src.forEach((v, i) => { d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }); g.putImageData(d, 0, 0); });
      const mx = Math.max(...kn);
      $('#w-gb-k2').style.gridTemplateColumns = `repeat(${k},1fr)`;
      $('#w-gb-k2').innerHTML = kn.map(v => `<i style="background:rgba(203,166,247,${(0.12 + 0.88 * v / mx).toFixed(2)})" title="${v.toFixed(3)}"></i>`).join('');
      $('#w-gb-code').textContent = `blur = cv.GaussianBlur(gray, (${k}, ${k}), cv.BORDER_DEFAULT)`;
      $('#w-gb-say').textContent = k === 1 ? 'A 1 × 1 kernel only looks at the pixel itself, so nothing changes.' : `Each new pixel is the weighted average of the ${k} × ${k} patch around it. The centre counts most, the edges of the patch count least, which is the bell shape you can see in the kernel.`;
    };
    $('#w-gb-k').oninput = run; run();
  },
  // intersection over union of two boxes: how well a predicted box matches the real one
  iouviz(el) {
    const W = 300, H = 180, T = [90, 50, 110, 80];
    el.innerHTML = `<p class="wgt">Try it: slide the predicted box</p>
      <div class="wgrow"><label>Shift x <input id="w-iu-x" type="range" min="-100" max="100" value="30"></label><label>Shift y <input id="w-iu-y" type="range" min="-70" max="70" value="15"></label><label>Size <input id="w-iu-s" type="range" min="50" max="160" value="100"></label></div>
      <canvas id="w-iu" width="${W}" height="${H}"></canvas><p class="wgsay" id="w-iu-say"></p>`;
    const run = () => {
      const dx = +$('#w-iu-x').value, dy = +$('#w-iu-y').value, s = +$('#w-iu-s').value / 100;
      const P = [T[0] + dx, T[1] + dy, T[2] * s, T[3] * s];
      const ix = Math.max(0, Math.min(T[0] + T[2], P[0] + P[2]) - Math.max(T[0], P[0])), iy = Math.max(0, Math.min(T[1] + T[3], P[1] + P[3]) - Math.max(T[1], P[1]));
      const inter = ix * iy, uni = T[2] * T[3] + P[2] * P[3] - inter, iou = inter / uni;
      const g = $('#w-iu').getContext('2d'); g.fillStyle = '#181825'; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(243,139,168,.25)'; g.fillRect(T[0], T[1], T[2], T[3]); g.fillStyle = 'rgba(137,180,250,.25)'; g.fillRect(P[0], P[1], P[2], P[3]);
      g.fillStyle = 'rgba(166,227,161,.6)'; g.fillRect(Math.max(T[0], P[0]), Math.max(T[1], P[1]), ix, iy);
      g.lineWidth = 2; g.strokeStyle = '#f38ba8'; g.strokeRect(T[0], T[1], T[2], T[3]); g.strokeStyle = '#89b4fa'; g.strokeRect(P[0], P[1], P[2], P[3]);
      g.font = '11px sans-serif'; g.fillStyle = '#f38ba8'; g.fillText('real box', 8, 14); g.fillStyle = '#89b4fa'; g.fillText('predicted box', 8, 28); g.fillStyle = '#a6e3a1'; g.fillText('overlap', 8, 42);
      $('#w-iu-say').innerHTML = `IoU = overlap / union = <b>${iou.toFixed(2)}</b>. ${iou > .7 ? 'A good match.' : iou > .4 ? 'Partly right, but loose.' : 'A poor match: the box is mostly on the wrong spot.'} 1.0 would be a perfect box, 0 means no overlap at all.`;
    };
    el.addEventListener('input', run); run();
  },
  // movement detection: subtract the previous frame, threshold, and box the cells that changed
  motiondiff(el) {
    const W = 180, H = 110, C = 10;
    el.innerHTML = `<p class="wgt">Try it: move the ball between frames</p>
      <div class="wgrow"><label>Ball x (this frame) <input id="w-md-x" type="range" min="20" max="160" value="90"></label><label>Last frame was <input id="w-md-d" type="range" min="0" max="40" value="14"></label><label>thresh <input id="w-md-t" type="range" min="5" max="120" value="40"></label></div>
      <div class="dropviz"><figure><figcaption>Previous frame</figcaption><canvas id="w-md-a" width="${W}" height="${H}"></canvas></figure><figure><figcaption>Current frame + box</figcaption><canvas id="w-md-b" width="${W}" height="${H}"></canvas></figure><figure><figcaption>absdiff, thresholded</figcaption><canvas id="w-md-c" width="${W}" height="${H}"></canvas></figure></div>
      <p class="wgsay" id="w-md-say"></p>`;
    const frame = (bx, seed) => { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; const f = new Float32Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) f[y * W + x] = 80 + (r() - 0.5) * 24 + ((x - bx) ** 2 + (y - 55) ** 2 < 16 * 16 ? 120 : 0); return f; };
    const show = (id, f, box) => { const g = $(id).getContext('2d'), d = g.createImageData(W, H); f.forEach((v, i) => { d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }); g.putImageData(d, 0, 0); if (box) { g.strokeStyle = '#a6e3a1'; g.lineWidth = 2; g.strokeRect(...box); } };
    const run = () => {
      const x = +$('#w-md-x').value, dd = +$('#w-md-d').value, t = +$('#w-md-t').value, prev = frame(x - dd, 5), cur = frame(x, 9);
      const diff = new Float32Array(W * H), cells = {};
      let n = 0; cur.forEach((v, i) => { const m = Math.abs(v - prev[i]) > t ? 255 : 0; diff[i] = m; if (m) { n++; const k = ((i % W / C) | 0) + ',' + (((i / W) | 0) / C | 0); cells[k] = (cells[k] || 0) + 1; } });
      const hot = Object.entries(cells).filter(([, c]) => c >= 14).map(([k]) => k.split(',').map(Number));
      let box = null; if (hot.length) { const xs = hot.map(h => h[0]), ys = hot.map(h => h[1]); box = [Math.min(...xs) * C, Math.min(...ys) * C, (Math.max(...xs) - Math.min(...xs) + 1) * C, (Math.max(...ys) - Math.min(...ys) + 1) * C]; }
      show('#w-md-a', prev); show('#w-md-b', cur, box); show('#w-md-c', diff);
      $('#w-md-say').innerHTML = `${n} pixels changed. ${dd === 0 ? 'The ball did not move between frames, so nothing shows up: no movement means no difference.' : t < 15 ? 'Threshold too low: camera noise counts as movement and speckles the mask.' : box ? 'Only the pixels that changed are white, so a box round them follows the ball.' : 'Nothing passed the threshold. Lower it a little.'}`;
    };
    el.addEventListener('input', run); run();
  },
  detectflow(el) {
    flowWidget(el, 'Click through one detection loop', [
      { t: 'Frame in', d: 'Grab the next picture from the webcam or the video file. Everything after this happens once per frame.', code: 'ret, frame = cap.read()' },
      { t: 'Prepare', d: 'Make the picture easy to read: grayscale for a Haar cascade, or leave it as colour for YOLO. Shrinking the frame here makes everything faster.', code: 'gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)' },
      { t: 'Detect', d: 'The detector scans the frame and returns a list of boxes. A cascade gives (x, y, w, h), YOLO gives corners plus a class and a confidence.', code: 'faces = cascade.detectMultiScale(gray, 1.3, 5)' },
      { t: 'Filter', d: 'Drop the weak ones. Raise minNeighbors for a cascade, or raise conf for YOLO, until the false boxes go away.', code: 'results = model(frame, conf=0.5)' },
      { t: 'Draw / act', d: 'Put the result to use: draw the boxes, count them, print the names, or trigger something such as a servo or an LCD message.', code: 'cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)' },
      { t: 'Show, then repeat', d: 'Display the frame and check for the quit key. Then go back to step 1 for the next frame.', code: 'cv.imshow("Detection", frame)' },
    ]);
  },
  yoloflow(el) {
    flowWidget(el, 'Click through train, then detect', [
      { t: 'Collect', d: 'Take many photos of the things you want found, in different light, angles and backgrounds. More variety teaches the model more.', code: '' },
      { t: 'Label', d: 'Draw a box round every object and give it a class name. Roboflow is a handy tool for this, and it exports a YOLO-format dataset.', code: '' },
      { t: 'data.yaml', d: 'The export includes a data.yaml that points to the train and validation folders and lists the class names.', code: 'data = "Yolo_setup/box.v5i.yolov11/data.yaml"' },
      { t: 'Train', d: 'Start from a small pretrained model and fine-tune it on your labelled pictures for a number of epochs.', code: 'model = YOLO("yolo11n.pt"); model.train(data=data, epochs=50, imgsz=320)' },
      { t: 'best.pt', d: 'Training saves the best weights as best.pt. That one file is your trained detector.', code: 'runs/detect/.../weights/best.pt' },
      { t: 'Detect', d: 'Load best.pt, feed it frames, and read back boxes, classes and confidences. This is the loop from the earlier diagram.', code: 'model = YOLO("best.pt"); results = model(frame, conf=0.5, imgsz=320)' },
    ]);
  },
  litflow(el) {
    flowWidget(el, 'Click through making a model lighter', [
      { t: 'Train', d: 'Train on a PC or in the cloud if you can, with a GPU. The Pi can train, but only small experiments are realistic.', code: 'best.pt' },
      { t: 'Shrink the input', d: 'A smaller working size and a smaller camera frame mean far less to compute.', code: 'imgsz=320  |  cap.set(cv.CAP_PROP_FRAME_WIDTH, 320)' },
      { t: 'Export', d: 'Convert the PyTorch weights to a format built for the Pi\'s ARM CPU. NCNN is the main target, ONNX is the portable fallback.', code: 'model.export(format="ncnn", imgsz=320)' },
      { t: 'Check', d: 'Load the exported model and make sure the detections still look right before you trust it.', code: 'YOLO("best_ncnn_model")' },
      { t: 'Run', d: 'Run the same detection loop with the lighter model. Inference should now be noticeably quicker on the Pi.', code: 'results = model(frame, conf=0.5, imgsz=320)' },
    ]);
  },
  // the OpenCV coordinate system: (0, 0) is the TOP-LEFT pixel and y grows downward; compare with a maths graph
  coordsys(el) {
    const GW = 16, GH = 10, C = 18, L = 40, T = 34, W = L + GW * C + 20, H = T + GH * C + 34;
    el.innerHTML = `<p class="wgt">Try it: hover and click the grid</p>
      <div class="csrow"><figure><figcaption>OpenCV image</figcaption><canvas id="w-cs-cv" width="${W}" height="${H}" style="cursor:crosshair"></canvas></figure>
        <figure><figcaption>Maths graph</figcaption><canvas id="w-cs-math" width="${W}" height="${H}" style="cursor:crosshair"></canvas></figure></div>
      <div class="evlog" id="w-cs-out"></div>`;
    // one shared point, always stored the OpenCV way: [x, row from the top]
    let hov = null, pin = null;
    const cvs = { cv: $('#w-cs-cv'), math: $('#w-cs-math') };
    const draw = mode => {
      const g = cvs[mode].getContext('2d');
      g.fillStyle = '#181825'; g.fillRect(0, 0, W, H);
      const cx = x => L + x * C, cy = row => T + row * C; // row = display row from the top
      g.strokeStyle = '#313244'; g.lineWidth = 1;
      for (let i = 0; i <= GW; i++) { g.beginPath(); g.moveTo(cx(i), T); g.lineTo(cx(i), T + GH * C); g.stroke(); }
      for (let j = 0; j <= GH; j++) { g.beginPath(); g.moveTo(L, cy(j)); g.lineTo(L + GW * C, cy(j)); g.stroke(); }
      g.font = '10px sans-serif'; g.fillStyle = '#a6adc8'; g.textAlign = 'center';
      const xl = mode === 'cv' ? T - 6 : T + GH * C + 14;
      for (let x = 0; x < GW; x += 5) g.fillText(x, cx(x) + C / 2, xl);
      g.fillText(GW - 1, cx(GW - 1) + C / 2, xl);
      g.textAlign = 'right';
      const yl = r => mode === 'cv' ? r : GH - 1 - r;
      for (let r = 0; r < GH; r += 5) g.fillText(yl(r), L - 6, cy(r) + C / 2 + 3);
      g.fillText(yl(GH - 1), L - 6, cy(GH - 1) + C / 2 + 3);
      // axes
      g.strokeStyle = '#89b4fa'; g.fillStyle = '#89b4fa'; g.lineWidth = 2; g.textAlign = 'left';
      const oy = mode === 'cv' ? T : T + GH * C;
      g.beginPath(); g.moveTo(L, oy); g.lineTo(L + GW * C + 14, oy); g.stroke(); g.textAlign = 'right'; g.fillText('x (columns) →', W - 6, mode === 'cv' ? oy - 20 : oy + 28); g.textAlign = 'left';
      g.strokeStyle = '#f38ba8'; g.fillStyle = '#f38ba8';
      g.beginPath(); g.moveTo(L, T + (mode === 'cv' ? 0 : -14)); g.lineTo(L, T + GH * C + (mode === 'cv' ? 14 : 0)); g.stroke();
      g.save(); g.translate(12, T + GH * C / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillText(mode === 'cv' ? 'y (rows), grows DOWN' : 'y, grows UP', 0, 0); g.restore();
      g.fillStyle = '#a6e3a1'; g.textAlign = 'left'; g.beginPath(); g.arc(L, oy, 4, 0, 7); g.fill();
      g.fillText(mode === 'cv' ? '(0, 0) top-left' : '(0, 0) bottom-left', L + 8, oy + (mode === 'cv' ? 12 : -8));
      g.textAlign = 'right'; g.fillStyle = '#a6adc8';
      if (mode === 'cv') { g.fillText(`(${GW - 1}, ${GH - 1}) bottom-right`, L + GW * C, T + GH * C + 16); g.textAlign = 'left'; g.fillText(`(0, ${GH - 1}) bottom-left`, L, T + GH * C + 16); }
      // points
      const mark = (pt, col, fillA) => { if (!pt) return; const r = mode === 'cv' ? pt[1] : GH - 1 - pt[1]; g.fillStyle = fillA; g.fillRect(cx(pt[0]), cy(r), C, C); g.strokeStyle = col; g.lineWidth = 2; g.strokeRect(cx(pt[0]) + 1, cy(r) + 1, C - 2, C - 2); };
      mark(hov, '#cdd6f4', 'rgba(205,214,244,.18)'); mark(pin, '#a6e3a1', 'rgba(166,227,161,.35)');
    };
    const redraw = () => {
      draw('cv'); draw('math');
      const pt = pin || hov;
      if (!pt) { $('#w-cs-out').innerHTML = 'Move the mouse over either grid. Each square is one pixel of a ' + GW + ' &times; ' + GH + ' picture, and the same pixel lights up on both.'; return; }
      const [x, y] = pt, my = GH - 1 - y;
      $('#w-cs-out').innerHTML = `OpenCV:  (x, y) = (${x}, ${y})   NumPy index img[${y}, ${x}] <i>row first</i>, img.shape = (${GH}, ${GW}) <i>(height, width)</i><br>Maths graph:  (x, y) = (${x}, ${my})   y is counted from the BOTTOM here, but from the TOP in OpenCV`;
    };
    const at = (e, mode) => { const r = cvs[mode].getBoundingClientRect(), px = (e.clientX - r.left) * W / r.width, py = (e.clientY - r.top) * H / r.height, x = Math.floor((px - L) / C), row = Math.floor((py - T) / C); return x >= 0 && x < GW && row >= 0 && row < GH ? [x, mode === 'cv' ? row : GH - 1 - row] : null; };
    ['cv', 'math'].forEach(m => {
      cvs[m].onmousemove = e => { hov = at(e, m); redraw(); };
      cvs[m].onmouseleave = () => { hov = null; redraw(); };
      cvs[m].onclick = e => { const p = at(e, m); pin = p && pin && p[0] === pin[0] && p[1] === pin[1] ? null : p; redraw(); };
    });
    el._reset = () => { hov = pin = null; redraw(); };
    redraw();
  },
  // hover the 21 MediaPipe hand landmarks to see their index and name
  landmarkmap(el) {
    const W = 300, H = 230;
    const P = [[.5, .95], [.4, .86], [.32, .75], [.27, .64], [.22, .55], [.42, .62], [.41, .45], [.4, .33], [.4, .22], [.5, .6], [.5, .42], [.5, .29], [.5, .17], [.58, .62], [.59, .45], [.6, .33], [.6, .23], [.65, .68], [.68, .55], [.7, .46], [.71, .38]];
    const links = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];
    const names = ['WRIST', 'THUMB_CMC', 'THUMB_MCP', 'THUMB_IP', 'THUMB_TIP', 'INDEX_FINGER_MCP', 'INDEX_FINGER_PIP', 'INDEX_FINGER_DIP', 'INDEX_FINGER_TIP', 'MIDDLE_FINGER_MCP', 'MIDDLE_FINGER_PIP', 'MIDDLE_FINGER_DIP', 'MIDDLE_FINGER_TIP', 'RING_FINGER_MCP', 'RING_FINGER_PIP', 'RING_FINGER_DIP', 'RING_FINGER_TIP', 'PINKY_MCP', 'PINKY_PIP', 'PINKY_DIP', 'PINKY_TIP'];
    el.innerHTML = `<p class="wgt">Try it: hover a landmark</p>
      <svg id="w-lm" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:340px"></svg><p class="wgsay" id="w-lm-say"></p>`;
    let at = 8;
    const draw = () => {
      $('#w-lm').innerHTML = links.map(([a, b]) => `<line x1="${P[a][0] * W}" y1="${P[a][1] * H}" x2="${P[b][0] * W}" y2="${P[b][1] * H}" stroke="var(--o0)" stroke-width="2"/>`).join('')
        + P.map((p, i) => `<circle data-i="${i}" cx="${p[0] * W}" cy="${p[1] * H}" r="${i === at ? 8 : 5}" fill="${i === at ? '#f38ba8' : [4, 8, 12, 16, 20].includes(i) ? '#a6e3a1' : '#cba6f7'}" style="cursor:pointer"/>`).join('')
        + `<text x="${P[at][0] * W + 12}" y="${P[at][1] * H + 4}" font-size="12" fill="#f38ba8">${at}</text>`;
      const f = at === 0 ? 'the wrist' : ['thumb', 'index finger', 'middle finger', 'ring finger', 'little finger'][Math.floor((at - 1) / 4)];
      const part = at === 0 ? '' : ['base joint', 'first knuckle', 'second knuckle', 'fingertip'][(at - 1) % 4];
      $('#w-lm-say').innerHTML = `Landmark <b>${at}</b>: <code>${names[at]}</code>, the ${at === 0 ? 'wrist' : part + ' of the ' + f}. Fingertips (4, 8, 12, 16, 20) are green.`;
    };
    $('#w-lm').onmouseover = e => { const c = e.target.closest('circle'); if (c) { at = +c.dataset.i; draw(); } };
    $('#w-lm').onclick = $('#w-lm').onmouseover;
    el._reset = () => { at = 8; draw(); }; draw();
  },
  // which tool for which job: YOLO, MediaPipe or a Haar cascade
  toolpicker(el) {
    const jobs = [
      ['Count the cars on a road', 'YOLO', 'It finds many objects of a common kind in one frame, and cars are in the classes a pretrained YOLO already knows.'],
      ['Tell which fingers are held up', 'MediaPipe', 'It gives the 21 hand landmarks straight away, with no training. Compare each fingertip with the joint below it.'],
      ['Find your own water bottle on a desk', 'YOLO', 'MediaPipe only knows what Google trained it for. YOLO can be trained on pictures of your bottle, as your own class.'],
      ['Check a person\'s posture while exercising', 'MediaPipe', 'Its pose model tracks 33 body landmarks, which is what you need for angles at the knee, hip or elbow.'],
      ['Find front-facing faces very fast on a Pi, with no training', 'Haar', 'A cascade is tiny, quick and needs no training. For more head angles, MediaPipe\'s face detection is the upgrade.'],
      ['Make a servo follow your fingertip', 'MediaPipe', 'Landmark 8 is the index fingertip. Its x position becomes the servo angle.'],
      ['Spot a missing item on a shelf of your own products', 'YOLO', 'Train YOLO on labelled pictures of your products, and count the boxes it returns.'],
    ];
    el.innerHTML = `<p class="wgt">Try it: pick a job, see the tool</p>
      <div class="tpj" id="w-tp-jobs">${jobs.map((j, i) => `<button type="button" class="tpb" data-i="${i}">${j[0]}</button>`).join('')}</div>
      <div class="tpres" id="w-tp"></div>`;
    const run = i => {
      $$('#w-tp-jobs button').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
      if (i < 0) { $('#w-tp').innerHTML = '<p class="wgsay">Choose a job above.</p>'; return; }
      const j = jobs[i];
      $('#w-tp').innerHTML = `<div class="tpt">${['YOLO', 'MediaPipe', 'Haar'].map(t => `<span class="${t === j[1] ? 'on' : ''}">${t}</span>`).join('')}</div><p>${j[2]}</p>`;
    };
    $('#w-tp-jobs').onclick = e => { const b = e.target.closest('button'); if (b) run(+b.dataset.i); };
    el._reset = () => run(-1); run(-1);
  },
  // bird's-eye view: the Pi in the middle and every part of the lab kit around it, with pins and wires
  hwmap(el) {
    const parts = [
      { id: 'cam', name: 'USB webcam', side: 'L', y: 18, line: 'USB', c: 'mauve', what: 'A USB (UVC) camera. It shows up as /dev/video0 and OpenCV opens it with cv.VideoCapture(0).', pins: [['Connection', 'Any USB port (no GPIO pins)'], ['Power', 'Taken from the USB port']], used: 'w6.py hand tracking, w7b.py YOLO detection', note: 'If the camera will not open, another program may already hold it. fuser /dev/video0 shows which.' },
      { id: 'led', name: 'LEDs + 220 ohm resistor', side: 'L', y: 100, line: 'GPIO 18 / 13 / 5, 6, 19, 26', c: 'blue', what: 'Light-emitting diodes. Each one needs a resistor in series so the pin does not push too much current through it.', pins: [['Single LED', 'GPIO18 > 220 ohm > LED anode (+), cathode (-) > GND'], ['PWM fade LED', 'GPIO13 (a hardware PWM pin)'], ['Row of 5 LEDs', 'GPIO5, 6, 13, 19, 26, each with its own 220 ohm resistor']], used: 'w2a, w2b, w3a, w3b, w4b', note: 'An LED only works one way round: the longer leg is the anode (+).' },
      { id: 'btn', name: 'Push buttons', side: 'L', y: 182, line: 'GPIO 23, 24 / 19, 26', c: 'blue', what: 'A switch that joins two legs while pressed. One leg goes to a GPIO pin, the other to GND, and the Pi\'s internal pull-up keeps the pin HIGH until you press.', pins: [['w3a, w3b', 'GPIO23 and GPIO24 (to GND, internal pull-up)'], ['w5a motor buttons', 'GPIO19 (forward) and GPIO26 (backward)']], used: 'w3a, w3b, w5a', note: 'With a pull-up, pressed reads LOW (0) and released reads HIGH (1): the opposite of what you might expect.' },
      { id: 'us', name: 'HC-SR04 ultrasonic', side: 'L', y: 264, line: 'GPIO 23 Trig, 24 Echo', c: 'teal', what: 'Sends a short ultrasonic ping and times how long the echo takes to come back. Distance = time x speed of sound / 2 (halved because the sound travels there and back). The speed of sound depends on the air temperature: the course code uses 331 + 0.6 x 25 = 346 m/s, which assumes a room temperature of 25 degrees C.', pins: [['VCC', '5V'], ['GND', 'GND'], ['Trig', 'GPIO23 (a 10 microsecond pulse starts a ping)'], ['Echo', 'GPIO24']], used: 'w4a, w4b', note: 'The Echo pin outputs 5V but Pi GPIO pins are 3.3V. Use a voltage divider on Echo to protect the pin.' },
      { id: 'lcd', name: '16x2 I2C LCD (PCF8574)', side: 'R', y: 18, line: 'I2C: GPIO2 SDA, GPIO3 SCL', c: 'teal', what: 'A 16 column, 2 row text screen with a PCF8574 I2C backpack, so it needs only two data wires.', pins: [['VCC', '5V'], ['GND', 'GND'], ['SDA', 'GPIO2 (physical pin 3), fixed by hardware'], ['SCL', 'GPIO3 (physical pin 5), fixed by hardware'], ['Address', 'usually 0x27, sometimes 0x3f (check with sudo i2cdetect -y 1)']], used: 'w7a, w7b', note: 'Turn on I2C once: sudo raspi-config, Interface Options, I2C, then reboot.' },
      { id: 'srv', name: 'SG90 servo', side: 'R', y: 100, line: 'GPIO 18 (PWM)', c: 'peach', what: 'A small motor that turns its arm to a set angle from 0 to 180 degrees, set by the width of a repeating pulse.', pins: [['Signal (orange or yellow)', 'GPIO18'], ['Power (red)', '5V, from an external supply if it draws too much for the Pi'], ['Ground (brown or black)', 'GND']], used: 'w6.py hand-tracking servo pointer', note: 'duty cycle = 2 + angle / 18, at 50 Hz.' },
      { id: 'mot', name: 'DC motor + L298N driver', side: 'R', y: 182, line: 'GPIO 13 ENA, 18 IN1, 12 IN2', c: 'red', what: 'A driver board that lets the Pi\'s weak pins control a motor on its own power supply. Two inputs pick the direction and one enable pin sets the speed.', pins: [['ENA (speed, PWM)', 'GPIO13'], ['IN1', 'GPIO18'], ['IN2', 'GPIO12'], ['Driver GND', 'Pi GND (shared ground)'], ['Motor power', 'A separate motor supply, NOT the Pi\'s 5V pin']], used: 'w5a, w5b', note: 'Always join the grounds, and never power the motor from the Pi.' },
    ];
    // icon, signal kind and the y centre of each box (left side then right side)
    const X = { cam: ['camera', 'USB input', 60], led: ['lightbulb', 'Digital and PWM output', 140], btn: ['check-circle', 'Digital input', 220], us: ['ruler', 'Digital out (Trig) and in (Echo)', 300],
      lcd: ['desktop', 'I2C bus', 80], srv: ['gear-six', 'PWM output', 180], mot: ['wrench', 'Digital and PWM output, through a driver', 280] };
    el.innerHTML = `<p class="wgt">Try it: click a part</p>
      <svg id="w-hw" viewBox="0 0 640 360" width="100%"></svg><div class="hwd" id="w-hwd"></div>`;
    let at = 'led';
    const draw = () => {
      let h = `<rect x="250" y="14" width="140" height="332" rx="14" fill="var(--crust)" stroke="var(--o0)" stroke-width="2"/>`;
      for (let r = 0; r < 8; r++) for (let c = 0; c < 2; c++) h += `<circle cx="${302 + c * 18}" cy="${34 + r * 10}" r="2.6" fill="var(--o0)"/>`;
      h += `<text x="320" y="124" text-anchor="middle" font-size="10" fill="var(--o1)">40-pin GPIO header</text><line x1="268" y1="138" x2="372" y2="138" stroke="var(--s1)"/><svg x="307" y="156" width="26" height="26" class="i" style="color:var(--mauve)"><use href="#i-circuitry"/></svg><text x="320" y="208" text-anchor="middle" font-size="15" fill="var(--text)">Raspberry Pi 4</text><text x="320" y="226" text-anchor="middle" font-size="10" fill="var(--o1)">Broadcom BCM2711</text><text x="320" y="241" text-anchor="middle" font-size="10" fill="var(--o1)">Debian, Python 3.11</text><line x1="268" y1="290" x2="372" y2="290" stroke="var(--s1)"/><text x="320" y="310" text-anchor="middle" font-size="9" fill="var(--o1)">USB · Wi-Fi</text><text x="320" y="324" text-anchor="middle" font-size="9" fill="var(--o1)">HDMI · microSD</text>`;
      parts.forEach(q => {
        const on = q.id === at, [ic, , cy] = X[q.id], left = q.side === 'L', bx = left ? 6 : 444, ex = left ? 196 : 444, px = left ? 250 : 390;
        h += `<line x1="${ex}" y1="${cy}" x2="${px}" y2="${cy}" stroke="var(--${on ? 'mauve' : 's1'})" stroke-width="${on ? 3 : 2}"/><circle cx="${px}" cy="${cy}" r="${on ? 5 : 3.5}" fill="var(--${on ? 'mauve' : 'o0'})"/>
          <g data-id="${q.id}" style="cursor:pointer"><rect x="${bx}" y="${cy - 28}" width="190" height="56" rx="10" fill="${on ? 'var(--mauve)' : 'var(--base)'}" stroke="var(--${on ? 'mauve' : 's1'})" stroke-width="1.5"/>
          <circle cx="${bx + 25}" cy="${cy}" r="14" fill="${on ? 'var(--crust)' : 'var(--s0)'}"/><svg x="${bx + 17}" y="${cy - 8}" width="16" height="16" class="i" style="color:${on ? 'var(--mauve)' : 'var(--text)'}"><use href="#i-${ic}"/></svg>
          <text x="${bx + 48}" y="${cy - 2}" font-size="11" fill="${on ? 'var(--crust)' : 'var(--text)'}" font-weight="${on ? 700 : 400}">${q.name}</text><text x="${bx + 48}" y="${cy + 13}" font-size="9" fill="${on ? 'var(--crust)' : 'var(--o1)'}">${q.line}</text></g>`;
      });
      $('#w-hw').innerHTML = h;
      const q = parts.find(z => z.id === at);
      $('#w-hwd').innerHTML = `<b>${q.name}</b><span class="hwk">${X[q.id][1]}</span><p>${q.what}</p><div class="hwt">${q.pins.map(r => `<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div><p class="hwn"><b>Used in:</b> ${q.used}. ${q.note}</p>`;
    };
    $('#w-hw').onclick = e => { const g = e.target.closest('g[data-id]'); if (g) { at = g.dataset.id; draw(); } };
    el._reset = () => { at = 'led'; draw(); }; draw();
  },
  // a detailed top view of the Pi 4 board: the real parts, the 40 pins one by one, and what each does
  piboard(el) {
    const W = 560, H = 366;
    const kind = n => [1, 17].includes(n) ? 'peach' : [2, 4].includes(n) ? 'red' : [6, 9, 14, 20, 25, 30, 34, 39].includes(n) ? 'o0' : [3, 5].includes(n) ? 'teal' : [12, 32, 33, 35].includes(n) ? 'mauve' : 'blue';
    const Z = {
      gpio: ["40-pin GPIO header", "Two rows of 20 pins along the top edge, each coloured by its job: orange is 3.3 V, red is 5 V, grey is ground, blue is a general GPIO pin, mauve can make hardware PWM and teal is I2C. The next chapters wire LEDs, buttons, sensors, a motor and the LCD to it."],
      poe: ["PoE header", "A four-pin header near the GPIO header, made for the optional Power over Ethernet HAT, which lets the Pi take its power through the network cable. Nothing in this course uses it."],
      eth: ["Gigabit Ethernet", "A wired network port. The Pi 4 moved it to sit next to the GPIO header, compared with the older Pi 3. Two small LEDs beside it show the connection and the activity."],
      usb3: ["2 x USB 3.0 (blue)", "The two blue ports are the fast USB 3.0 ones. They suit a webcam or a fast drive, where speed matters, so they are good places to plug in the camera for the vision work."],
      usb2: ["2 x USB 2.0 (black)", "The two black ports are the slower USB 2.0 ones. They are fine for a keyboard, a mouse or other small devices that do not need much speed."],
      vl805: ["VL805 USB controller", "A small black chip behind the USB ports. It is the USB controller: it manages the traffic for all four USB ports, so the main chip does not have to handle each device itself."],
      soc: ["BCM2711 system on a chip", "The main chip: four 64-bit ARM Cortex-A72 cores and the graphics, all in one package. On the Pi 4 it sits under a metal heat spreader, and it does the work of running your Python and the vision models."],
      ram: ["LPDDR4 RAM", "The working memory, low-power DDR4. It holds your running program, the camera frames and the model. How much you have, for example 2, 4 or 8 GB, depends on the model you bought."],
      wifi: ["Wi-Fi and Bluetooth module", "A radio module under a metal shield. It gives the Pi dual-band Wi-Fi and Bluetooth 5.0, so it can join a network and talk to wireless devices without any cable."],
      sd: ["microSD slot (underside)", "The microSD card slot is on the underside of the board. The card is the Pi's drive: it holds the operating system and all your files, so flashing the OS means writing to this card."],
      usbc: ["USB-C power in", "Power comes in here at 5 volts. Use a proper power supply, because a weak one makes the Pi slow itself down or even reboot, usually while you are running a heavy program."],
      hdmi: ["2 x micro-HDMI (HDMI0, HDMI1)", "Two video outputs, labelled HDMI0 and HDMI1. They are micro-HDMI, so you need micro-HDMI to HDMI cables, and together they can drive two screens at once."],
      audio: ["3.5 mm AV jack", "A 4-pole 3.5 mm jack. It carries stereo audio for headphones or speakers, and the same jack can also send composite video to an old TV."],
      csi: ["CSI camera port", "A 2-lane flat-ribbon connector, labelled CAMERA, for the Raspberry Pi camera module. A USB webcam does not use it, because it plugs into one of the USB ports instead."],
      dsi: ["DSI display port", "A 2-lane flat-ribbon connector, labelled DISPLAY, for the official Raspberry Pi touchscreen. A normal monitor does not use it, because it connects through the HDMI ports."],
      leds: ["Status LEDs", "Two small status lights on the board: a power LED and an activity LED. If the power one is off, the Pi has no power. The activity one flickers while the Pi reads the card."],
    };
    let at = 'gpio';
    const draw = () => {
      const faint = 'color-mix(in srgb,var(--lavender) 28%,var(--crust))';
      const on = id => at === id;
      const g = (id, inner) => `<g data-id="${id}" style="cursor:pointer">${inner}</g>`;
      // one simple box style: dark fill, thin soft border, a thin lavender border when selected
      const ICON = { soc: 'cpu', ram: 'cube', wifi: 'globe', vl805: 'circuitry', sd: 'hard-drives', eth: 'path', usb3: 'puzzle-piece', usb2: 'puzzle-piece', usbc: 'lightning', poe: 'lightning', audio: 'play', csi: 'camera', hdmi: 'desktop', dsi: 'desktop' };
      const ic = (id, cx, y) => `<svg x="${cx - 6}" y="${y}" width="12" height="12" class="i" style="color:${on(id) ? 'var(--lavender)' : 'var(--o0)'}"><use href="#i-${ICON[id]}"/></svg>`;
      const box = (id, x, y, w, h, label, sub, dash) => {
        const cx = x + w / 2, big = h >= 60, iy = big ? y + h / 2 - 26 : y + (sub ? 3 : 4), ly = big ? y + h / 2 + 4 : y + h - (sub ? 14 : 8), sy = big ? y + h / 2 + 15 : y + h - 5;
        return g(id, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="var(--crust)" stroke="${on(id) ? 'var(--lavender)' : faint}" stroke-width="${on(id) ? 1.5 : 1}" ${dash ? 'stroke-dasharray="5 4"' : ''}/>${ic(id, cx, iy)}<text x="${cx}" y="${ly}" text-anchor="middle" font-size="9" fill="var(--text)">${label}</text>${sub ? `<text x="${cx}" y="${sy}" text-anchor="middle" font-size="7" fill="var(--o1)">${sub}</text>` : ''}`);
      };
      let h = `<rect x="14" y="8" width="532" height="350" rx="18" fill="var(--mantle)" stroke="${faint}" stroke-width="1.5"/>`;
      [[41, 31], [395, 31], [41, 335], [395, 335]].forEach(([x, y]) => { h += `<circle cx="${x}" cy="${y}" r="7" fill="var(--crust)" stroke="${faint}"/>`; });
      // the 40-pin strip: odd pins on the inner row, pin 1 at the left end
      let pins = `<rect x="64" y="26" width="320" height="36" rx="6" fill="var(--crust)" stroke="${on('gpio') ? 'var(--lavender)' : faint}" stroke-width="${on('gpio') ? 1.5 : 1}"/>`;
      for (let n = 1; n <= 40; n++) { const c = Math.floor((n - 1) / 2), x = 74 + c * 15.5, y = n % 2 ? 52 : 36; pins += `<circle cx="${x}" cy="${y}" r="4.2" fill="var(--${kind(n)})"/>`; }
      pins += `<text x="74" y="76" text-anchor="middle" font-size="8" fill="var(--o1)">1</text><text x="74" y="22" text-anchor="middle" font-size="8" fill="var(--o1)">2</text><text x="369" y="76" text-anchor="middle" font-size="8" fill="var(--o1)">39</text><text x="369" y="22" text-anchor="middle" font-size="8" fill="var(--o1)">40</text>`;
      h += g('gpio', pins);
      h += box('poe', 414, 28, 30, 30, 'PoE');
      h += box('wifi', 70, 104, 80, 42, 'Wi-Fi + BT');
      h += box('soc', 166, 110, 104, 88, 'BCM2711', 'SoC');
      h += box('ram', 286, 120, 62, 68, 'RAM', 'LPDDR4');
      h += box('vl805', 366, 210, 70, 46, 'VL805', 'USB controller');
      h += box('sd', 56, 214, 88, 84, 'microSD', 'underneath', true);
      h += g('dsi', `<rect x="22" y="130" width="22" height="64" rx="5" fill="var(--crust)" stroke="${on('dsi') ? 'var(--lavender)' : faint}" stroke-width="${on('dsi') ? 1.5 : 1}"/>${ic('dsi', 33, 136)}<text x="33" y="190" font-size="7" fill="var(--text)" transform="rotate(-90 33 190)">DISPLAY</text>`);
      h += box('eth', 450, 56, 92, 110, 'Ethernet');
      h += box('usb3', 450, 172, 92, 84, 'USB 3.0', '2 ports');
      h += box('usb2', 450, 262, 92, 84, 'USB 2.0', '2 ports');
      h += box('usbc', 160, 320, 52, 34, 'USB-C');
      h += g('hdmi', [0, 1].map(i => `<rect x="${224 + i * 56}" y="320" width="46" height="34" rx="6" fill="var(--crust)" stroke="${on('hdmi') ? 'var(--lavender)' : faint}" stroke-width="${on('hdmi') ? 1.5 : 1}"/>${ic('hdmi', 247 + i * 56, 324)}<text x="${247 + i * 56}" y="346" text-anchor="middle" font-size="8" fill="var(--text)">HDMI${i}</text>`).join(''));
      h += box('audio', 338, 320, 40, 34, 'AV');
      h += box('csi', 386, 320, 54, 34, 'CAMERA');
      h += g('leds', `<rect x="76" y="318" width="40" height="30" rx="6" fill="var(--crust)" stroke="${on('leds') ? 'var(--lavender)' : faint}" stroke-width="${on('leds') ? 1.5 : 1}"/><circle cx="88" cy="330" r="3.5" fill="var(--red)"/><circle cx="104" cy="330" r="3.5" fill="var(--green)"/><text x="96" y="343" text-anchor="middle" font-size="6.5" fill="var(--o1)">PWR  ACT</text>`);
      $('#w-pb').innerHTML = h;
      const z = Z[at];
      $('#w-pbd').innerHTML = `<b>${z[0]}</b><p>${z[1]}</p>`;
    };
    el.innerHTML = `<p class="wgt">Try it: click a part of the board</p>
      <svg id="w-pb" viewBox="0 0 ${W} ${H}" width="100%"></svg><div class="hwd" id="w-pbd"></div>`;
    $('#w-pb').onclick = e => { const g = e.target.closest('g[data-id]'); if (g) { at = g.dataset.id; draw(); } };
    el._reset = () => { at = 'gpio'; draw(); }; draw();
  },
  // the 40-pin GPIO header: hover or click a pin for its job; pins used in this course are outlined
  gpiopins(el) {
    const L = { 1: ['3V3', 'pwr3'], 2: ['5V', 'pwr5'], 3: ['GPIO2', 'i2c', 'I2C1 SDA'], 4: ['5V', 'pwr5'], 5: ['GPIO3', 'i2c', 'I2C1 SCL'], 6: ['GND', 'gnd'], 7: ['GPIO4', 'gpio'], 8: ['GPIO14', 'gpio', 'UART TXD'], 9: ['GND', 'gnd'], 10: ['GPIO15', 'gpio', 'UART RXD'], 11: ['GPIO17', 'gpio'], 12: ['GPIO18', 'pwm', 'hardware PWM'], 13: ['GPIO27', 'gpio'], 14: ['GND', 'gnd'], 15: ['GPIO22', 'gpio'], 16: ['GPIO23', 'gpio'], 17: ['3V3', 'pwr3'], 18: ['GPIO24', 'gpio'], 19: ['GPIO10', 'gpio', 'SPI MOSI'], 20: ['GND', 'gnd'], 21: ['GPIO9', 'gpio', 'SPI MISO'], 22: ['GPIO25', 'gpio'], 23: ['GPIO11', 'gpio', 'SPI SCLK'], 24: ['GPIO8', 'gpio', 'SPI CE0'], 25: ['GND', 'gnd'], 26: ['GPIO7', 'gpio', 'SPI CE1'], 27: ['GPIO0', 'gpio', 'ID EEPROM'], 28: ['GPIO1', 'gpio', 'ID EEPROM'], 29: ['GPIO5', 'gpio'], 30: ['GND', 'gnd'], 31: ['GPIO6', 'gpio'], 32: ['GPIO12', 'pwm', 'hardware PWM'], 33: ['GPIO13', 'pwm', 'hardware PWM'], 34: ['GND', 'gnd'], 35: ['GPIO19', 'pwm', 'hardware PWM'], 36: ['GPIO16', 'gpio'], 37: ['GPIO26', 'gpio'], 38: ['GPIO20', 'gpio'], 39: ['GND', 'gnd'], 40: ['GPIO21', 'gpio'] };
    const used = { 2: '5V for the servo, HC-SR04 and LCD', 4: '5V (a second 5V pin)', 3: 'LCD SDA (w7a, w7b)', 5: 'LCD SCL (w7a, w7b)', 6: 'a ground for sensors and the LCD', 12: 'LED (w2a, w3a), motor IN1 (w5), servo signal (w6)', 33: 'PWM LED (w2b), motor ENA (w5), one of the 5 LEDs', 32: 'motor IN2 (w5)', 16: 'button 1 (w3), HC-SR04 Trig (w4)', 18: 'button 2 (w3), HC-SR04 Echo (w4)', 29: 'LED chain (w3b, w4b)', 31: 'LED chain (w3b, w4b)', 35: 'LED chain (w3b, w4b), forward button (w5a)', 37: 'LED chain (w3b, w4b), backward button (w5a)' };
    const col = { pwr3: 'peach', pwr5: 'red', gnd: 'o0', gpio: 'blue', pwm: 'mauve', i2c: 'teal' };
    el.innerHTML = `<p class="wgt">Try it: click a pin</p>
      <div class="wgrow" id="w-gp-tabs">${['All', 'Used in the course', 'Power and ground', 'Special'].map((n, i) => `<button type="button" class="seg2${i ? '' : ' on'}" data-k="${n}">${n}</button>`).join('')}</div>
      <div class="gph"><div class="gpl" id="w-gp"></div><div class="gpd" id="w-gp-d"></div></div>`;
    let at = 12, tab = 'All';
    const draw = () => {
      $$('#w-gp-tabs button').forEach(b => b.classList.toggle('on', b.dataset.k === tab));
      const show = n => { const t = L[n][1]; return tab === 'All' || (tab === 'Used in the course' && used[n]) || (tab === 'Power and ground' && /pwr|gnd/.test(t)) || (tab === 'Special' && /pwm|i2c/.test(t) || (tab === 'Special' && L[n][2])); };
      const cell = n => `<button type="button" class="gpp${n === at ? ' sel' : ''}${used[n] ? ' used' : ''}" data-n="${n}" style="--c:var(--${col[L[n][1]]});opacity:${show(n) ? 1 : .22}"><i>${n}</i>${L[n][0]}</button>`;
      let h = ''; for (let n = 1; n < 40; n += 2) h += cell(n) + cell(n + 1);
      $('#w-gp').innerHTML = h;
      const [name, t, fn] = L[at];
      const GI = { pwr3: 'lightning', pwr5: 'lightning', gnd: 'caret-down', gpio: 'circuitry', pwm: 'gear-six', i2c: 'chat-text' };
      const KIND = { pwr3: 'Power, 3.3 volts', pwr5: 'Power, 5 volts', gnd: 'Ground, 0 volts', gpio: 'General input / output', pwm: 'General input / output', i2c: 'I2C bus (fixed, not general GPIO)' };
      const DESC = { pwr3: 'A 3.3 volt power pin.', pwr5: 'A 5 volt power pin, straight from the supply.', gnd: 'Ground. Connect the grounds of all parts together.', gpio: 'You can set it HIGH or LOW, or read it.', pwm: 'You can set it HIGH or LOW, or read it, and it can also make hardware PWM.', i2c: 'The two wires of the I2C bus, used by the LCD.' };
      const isGpio = /GPIO/.test(name), row = (k, v) => `<div><span>${k}</span><b>${v}</b></div>`;
      $('#w-gp-d').innerHTML = `<div class="gh"><b>${name}</b></div><p>${DESC[t]}</p>
        <div class="hwt">${row('Physical pin', at)}${isGpio ? row('BCM number', name.slice(4)) : ''}${row('Kind', KIND[t])}${isGpio ? row('Hardware PWM', t === 'pwm' ? '<em class="yes">Yes</em>' : 'No') : ''}${fn && fn !== 'hardware PWM' ? row('Also used for', fn) : ''}${row('In this course', used[at] || 'Not used by the course scripts')}</div>
        <p class="hwn">${icon('info')}Hardware PWM pins: GPIO12, GPIO13, GPIO18 and GPIO19 (physical pins 32, 33, 12 and 35). They are the mauve ones.</p>`;
    };
    $('#w-gp').onclick = e => { const b = e.target.closest('.gpp'); if (b) { at = +b.dataset.n; draw(); } };
    $('#w-gp-tabs').onclick = e => { const b = e.target.closest('button'); if (b) { tab = b.dataset.k; draw(); } };
    el._reset = () => { at = 12; tab = 'All'; draw(); }; draw();
  },
  // H-bridge: two direction inputs and one enable pin decide what the motor does
  hbridge(el) {
    el.innerHTML = `<p class="wgt">Try it: set the pins</p>
      <div class="wgrow"><button type="button" class="seg2" id="w-hb-1" data-v="1">IN1 = LOW</button><button type="button" class="seg2" id="w-hb-2" data-v="1">IN2 = LOW</button><label>ENA duty <input id="w-hb-e" type="range" min="0" max="100" value="40"></label><b id="w-hb-ev">40%</b></div>
      <svg id="w-hb" viewBox="0 0 300 130" width="100%" style="max-width:340px"></svg><p class="wgsay" id="w-hb-say"></p><p class="wgsay"><code id="w-hb-code"></code></p>`;
    let i1 = 0, i2 = 0;
    const run = () => {
      const d = +$('#w-hb-e').value; $('#w-hb-ev').textContent = d + '%';
      $('#w-hb-1').textContent = `IN1 = ${i1 ? 'HIGH' : 'LOW'}`; $('#w-hb-2').textContent = `IN2 = ${i2 ? 'HIGH' : 'LOW'}`;
      $('#w-hb-1').classList.toggle('on', !!i1); $('#w-hb-2').classList.toggle('on', !!i2);
      let state, col = '#a6adc8', arrow = '';
      if (d === 0) state = 'Enable is 0%, so the driver is switched off. The motor is not driven and just coasts to a stop.';
      else if (i1 && !i2) { state = `Forward at ${d}% speed.`; col = '#a6e3a1'; arrow = '\u21bb'; }
      else if (!i1 && i2) { state = `Backward at ${d}% speed.`; col = '#89b4fa'; arrow = '\u21ba'; }
      else if (i1 && i2) state = 'Both inputs HIGH: the driver shorts the motor terminals together, which is a fast stop (brake).';
      else state = 'Both inputs LOW with the enable on: the motor is held stopped (brake). In the course code this is the "stop" state.';
      $('#w-hb').innerHTML = `<rect x="10" y="30" width="86" height="70" rx="8" fill="var(--crust)" stroke="var(--mauve)"/><text x="53" y="52" text-anchor="middle" font-size="10" fill="var(--text)">L298N driver</text><text x="53" y="70" text-anchor="middle" font-size="9" fill="var(--o1)">IN1 ${i1} IN2 ${i2}</text><text x="53" y="86" text-anchor="middle" font-size="9" fill="var(--o1)">ENA ${d}%</text><line x1="96" y1="65" x2="170" y2="65" stroke="${col}" stroke-width="3"/><circle cx="215" cy="65" r="40" fill="var(--crust)" stroke="${col}" stroke-width="3"/><text x="215" y="76" text-anchor="middle" font-size="34" fill="${col}">${arrow || 'M'}</text><rect x="170" y="116" width="${Math.max(2, 90 * d / 100)}" height="6" rx="3" fill="${col}"/>`;
      $('#w-hb-say').textContent = state;
      $('#w-hb-code').textContent = `GPIO.output(IN1, ${i1 ? 'HIGH' : 'LOW'}); GPIO.output(IN2, ${i2 ? 'HIGH' : 'LOW'}); pwm_motor.ChangeDutyCycle(${d})`;
    };
    $('#w-hb-1').onclick = () => { i1 ^= 1; run(); }; $('#w-hb-2').onclick = () => { i2 ^= 1; run(); };
    $('#w-hb-e').oninput = run;
    el._reset = () => { i1 = i2 = 0; $('#w-hb-e').value = 40; run(); }; run();
  },
  // the vim modes, with the keys that matter in each
  vimmodes(el) {
    const modes = {
      Normal: ['Where vim starts. Keys are commands, not letters.', [['i', 'enter Insert mode, before the cursor'], ['a', 'enter Insert mode, after the cursor'], ['dd', 'delete the whole line'], ['yy', 'copy the line'], ['p', 'paste'], ['u', 'undo'], ['/word', 'search for "word", n for the next match'], ['gg / G', 'jump to the top / bottom of the file']]],
      Insert: ['Where you type text, like a normal editor.', [['Esc', 'go back to Normal mode'], ['(any key)', 'types that character']]],
      Command: ['Press : from Normal mode, type a command, then Enter.', [[':w', 'save'], [':q', 'quit'], [':wq', 'save and quit'], [':q!', 'quit and throw away changes'], [':set number', 'show line numbers']]],
    };
    el.innerHTML = `<p class="wgt">Try it: pick a mode</p>
      <div class="wgrow" id="w-vm-tabs">${Object.keys(modes).map((n, i) => `<button type="button" class="seg2${i ? '' : ' on'}" data-k="${n}">${n}</button>`).join('')}</div>
      <p class="wgsay" id="w-vm-say"></p><div class="hwt" id="w-vm"></div>`;
    const run = k => { $$('#w-vm-tabs button').forEach(b => b.classList.toggle('on', b.dataset.k === k)); $('#w-vm-say').textContent = modes[k][0]; $('#w-vm').innerHTML = modes[k][1].map(r => `<div><span><code>${r[0]}</code></span><b>${r[1]}</b></div>`).join(''); };
    $('#w-vm-tabs').onclick = e => { const b = e.target.closest('button'); if (b) run(b.dataset.k); };
    run('Normal');
  },
  // a list you can change: append, insert, pop, sort and reverse, with the index (and negative index) under every item
  listops(el) {
    const pool = ['Moonlight', 'Neon', 'Harbor', 'Velvet', 'Atlas', 'Drift'];
    let L, k, code;
    const take = () => pool[k++ % pool.length];
    const ops = {
      'append': () => { const v = take(); L.push(v); return `playlist.append("${v}")`; },
      'insert(1, ...)': () => { const v = take(); L.splice(1, 0, v); return `playlist.insert(1, "${v}")`; },
      'pop()': () => L.length ? (L.pop(), 'playlist.pop()') : 'playlist.pop()   # IndexError: pop from empty list',
      'pop(0)': () => L.length ? (L.shift(), 'playlist.pop(0)') : 'playlist.pop(0)   # IndexError: pop from empty list',
      'sort()': () => { L.sort(); return 'playlist.sort()'; },
      'reverse()': () => { L.reverse(); return 'playlist.reverse()'; },
    };
    el.innerHTML = `<p class="wgt">Try it: change the list</p>
      <div class="wgrow" id="w-lo-b">${Object.keys(ops).map(n => `<button type="button" class="seg2" data-o="${n}">${n}</button>`).join('')}</div>
      <div class="lrow" id="w-lo"></div>
      <figure class="code"><figcaption>python</figcaption><pre><code id="w-lo-c"></code></pre></figure>`;
    const draw = () => {
      $('#w-lo').innerHTML = L.length ? L.map((v, i) => `<div class="lc"><small>${i}</small><b>${v}</b><small>${i - L.length}</small></div>`).join('') : '<p class="wgsay">The list is empty: []</p>';
      $('#w-lo-c').innerHTML = mdCode(`${code}\nprint(playlist)        # [${L.map(v => `'${v}'`).join(', ')}]\nprint(len(playlist))   # ${L.length}`, 'python');
    };
    const start = () => { L = ['Blue', 'Sunrise', 'Tokyo', 'Echo']; k = 0; code = 'playlist = ["Blue", "Sunrise", "Tokyo", "Echo"]'; draw(); };
    $('#w-lo-b').onclick = e => { const b = e.target.closest('button'); if (b) { code = ops[b.dataset.o](); draw(); } };
    el._reset = start; start();
  },
  // drag a score and watch which branch of an if / elif ladder fires, and which ones are never checked
  gradeladder(el) {
    const R = [[80, '4'], [75, '3.5'], [70, '3'], [65, '2.5'], [60, '2'], [55, '1.5'], [50, '1']];
    el.innerHTML = `<p class="wgt">Try it: drag the score</p>
      <div class="wgrow"><label>score <input id="w-gl" type="range" min="0" max="100" value="68"></label><b id="w-gl-v"></b></div>
      <div class="ladder" id="w-gl-r"></div>`;
    const run = () => {
      const s = +$('#w-gl').value; $('#w-gl-v').textContent = s;
      let hit = R.findIndex(r => s >= r[0]); if (hit < 0) hit = R.length;
      const row = (i, c, t) => `<div class="${i === hit ? 'hit' : i < hit ? 'no' : 'skip'}"><code>${c}</code><span>${i < hit ? 'False, keep going' : i === hit ? t : 'never checked'}</span></div>`;
      $('#w-gl-r').innerHTML = R.map((r, i) => row(i, `${i ? 'elif' : 'if'} score >= ${r[0]}:`, `True: Grade ${r[1]}`)).join('') + row(R.length, 'else:', 'Grade 0');
    };
    $('#w-gl').oninput = run; el._reset = () => { $('#w-gl').value = 68; run(); }; run();
  },
  // type a start, stop and step and see exactly which numbers range() makes (stop is never included)
  rangeviz(el) {
    el.innerHTML = `<p class="wgt">Try it: build a range</p>
      <div class="wgrow"><label>start <input id="w-rg-a" type="number" value="0"></label><label>stop <input id="w-rg-b" type="number" value="10"></label><label>step <input id="w-rg-c" type="number" value="2"></label></div>
      <figure class="code"><figcaption>python</figcaption><pre><code id="w-rg-c0"></code></pre></figure>
      <div class="lrow" id="w-rg"></div><p class="wgo" id="w-rg-n"></p>`;
    const run = () => {
      const a = parseInt($('#w-rg-a').value) || 0, b = parseInt($('#w-rg-b').value) || 0, c = parseInt($('#w-rg-c').value);
      $('#w-rg-c0').innerHTML = mdCode(`for i in range(${a}, ${b}, ${isNaN(c) ? 1 : c}):\n    print(i)`, 'python');
      if (!c) { $('#w-rg').innerHTML = ''; $('#w-rg-n').innerHTML = 'A step of 0 is not allowed: <b style="color:var(--red)">ValueError</b>'; return; }
      const out = []; for (let i = a; c > 0 ? i < b : i > b; i += c) { out.push(i); if (out.length > 40) break; }
      $('#w-rg').innerHTML = out.slice(0, 40).map(v => `<div class="lc"><b>${v}</b></div>`).join('') || '<p class="wgsay">Nothing: the loop body never runs.</p>';
      $('#w-rg-n').innerHTML = `${out.length > 40 ? '40+' : out.length} numbers. <b>${b}</b> is where it stops, and it is not included.`;
    };
    el.addEventListener('input', run); el._reset = () => { $('#w-rg-a').value = 0; $('#w-rg-b').value = 10; $('#w-rg-c').value = 2; run(); }; run();
  },
  // a function as a machine: arguments go in, the body runs, a value comes out
  funcmachine(el) {
    el.innerHTML = `<p class="wgt">Try it: call bmi_calculator</p>
      <div class="wgrow"><label>weight (kg) <input id="w-fm-w" type="number" value="60"></label><label>height (cm) <input id="w-fm-h" type="number" value="170"></label></div>
      <div class="fmach"><div><small>call</small><code id="w-fm-1"></code></div><div><small>inside</small><code id="w-fm-2"></code></div><div><small>result</small><code id="w-fm-3"></code></div></div>`;
    const run = () => {
      const w = +$('#w-fm-w').value, h = +$('#w-fm-h').value;
      $('#w-fm-1').textContent = `bmi_calculator(${w}, ${h})`;
      if (!(h > 0) || w < 0) { $('#w-fm-2').textContent = 'height must be above 0'; $('#w-fm-3').textContent = 'error'; return; }
      const m = h / 100, b = w / (m * m);
      $('#w-fm-2').textContent = `h1 = ${m.toFixed(2)}\nbmi = ${w} / ${m.toFixed(2)}**2`;
      $('#w-fm-3').textContent = `${b.toFixed(2)}  (${b < 18.5 ? 'under' : b < 25 ? 'normal' : b < 30 ? 'over' : 'obese'})`;
    };
    el.addEventListener('input', run); el._reset = () => { $('#w-fm-w').value = 60; $('#w-fm-h').value = 170; run(); }; run();
  },
  // look up a key in a menu dictionary: [] fails on a missing key, .get() gives None
  dictlookup(el) {
    const menu = { Burger: 250, Pizza: 199, Frenchfries: 299 };
    el.innerHTML = `<p class="wgt">Try it: look up a key</p>
      <figure class="code"><figcaption>python</figcaption><pre><code>${mdCode('menu = {"Burger": 250, "Pizza": 199, "Frenchfries": 299}', 'python')}</code></pre></figure>
      <div class="wgrow" id="w-dl-b">${[...Object.keys(menu), 'Salad'].map((n, i) => `<button type="button" class="seg2${i ? '' : ' on'}" data-k="${n}">${n}</button>`).join('')}</div>
      <div class="wgtable mono" id="w-dl"></div>`;
    const run = k => {
      $$('#w-dl-b button').forEach(b => b.classList.toggle('on', b.dataset.k === k));
      const has = k in menu, row = (c, r, bad) => `<div><code>${c}</code><span class="${bad ? 'bad' : 'ok'}">${r}</span></div>`;
      $('#w-dl').innerHTML = row(`menu["${k}"]`, has ? menu[k] : `KeyError: '${k}'`, !has) + row(`menu.get("${k}")`, has ? menu[k] : 'None', !has) + row(`"${k}" in menu`, has ? 'True' : 'False', !has);
    };
    $('#w-dl-b').onclick = e => { const b = e.target.closest('button'); if (b) run(b.dataset.k); };
    el._reset = () => run('Burger'); run('Burger');
  },
  // an object holds its own data (attributes) and changes it through methods: the Businessman class
  objectviz(el) {
    let s;
    const acts = { work: [-10, 10, -20], sleep: [20, -10, 10], play: [-10, -10, 20] };
    el.innerHTML = `<p class="wgt">Try it: call a method</p>
      <figure class="code"><figcaption>python</figcaption><pre><code>${mdCode('man1 = Businessman(100, 100, 100)', 'python')}</code></pre></figure>
      <div class="wgrow" id="w-ob-b">${Object.keys(acts).map(n => `<button type="button" class="seg2" data-a="${n}">man1.${n}()</button>`).join('')}</div>
      <div class="bars" id="w-ob"></div>`;
    const draw = () => {
      $('#w-ob').innerHTML = [['hp', 'var(--red)'], ['money', 'var(--yellow)'], ['happiness', 'var(--green)']].map(([n, c], i) => `<div><span>self.${n}</span><i><u style="width:${Math.max(0, Math.min(100, s[i] / 2))}%;background:${c}"></u></i><b>${s[i]}</b></div>`).join('');
    };
    $('#w-ob-b').onclick = e => { const b = e.target.closest('button'); if (b) { acts[b.dataset.a].forEach((d, i) => s[i] += d); draw(); } };
    el._reset = () => { s = [100, 100, 100]; draw(); }; el._reset();
  },
  // the cafe order screen: tap an item to count it, submit to get a receipt (the same logic as the Tkinter exercise)
  cafeorder(el) {
    const price = { 'Thai Tea': 40, 'Milk Tea': 35, 'Matcha': 60, 'Drip Coffee': 30 };
    let cnt, que = 0, rec = '';
    el.innerHTML = `<p class="wgt">Try it: take an order</p>
      <div class="cafe" id="w-cf-b">${Object.keys(price).map(n => `<button type="button" data-n="${n}"><b>${n}</b><small>${price[n]} THB</small><span></span></button>`).join('')}</div>
      <div class="wgrow"><button type="button" class="seg2 on" id="w-cf-s">Submit Order</button><button type="button" class="seg2" id="w-cf-c">Clear Order</button></div>
      <figure class="code"><figcaption>python</figcaption><pre><code id="w-cf-d"></code></pre></figure>
      <pre class="rcpt" id="w-cf-r" hidden></pre>`;
    const draw = () => {
      $$('#w-cf-b button').forEach(b => { b.querySelector('span').textContent = cnt[b.dataset.n] ? 'x ' + cnt[b.dataset.n] : ' '; });
      $('#w-cf-d').innerHTML = mdCode('count = {' + Object.keys(cnt).map(n => `"${n}": ${cnt[n]}`).join(', ') + '}', 'python');
      $('#w-cf-r').hidden = !rec; $('#w-cf-r').textContent = rec;
    };
    const clear = () => { cnt = Object.fromEntries(Object.keys(price).map(n => [n, 0])); rec = ''; draw(); };
    $('#w-cf-b').onclick = e => { const b = e.target.closest('button'); if (b) { cnt[b.dataset.n]++; rec = ''; draw(); } };
    $('#w-cf-c').onclick = clear;
    $('#w-cf-s').onclick = () => {
      let tot = 0, r = `--- Your Order (${++que}) ---\n`;
      for (const n in cnt) if (cnt[n]) { r += `${n}: ${cnt[n]} x ${price[n]} THB = ${cnt[n] * price[n]} THB\n`; tot += cnt[n] * price[n]; }
      clear(); rec = r + `--- Total: ${tot} THB ---`; draw();
    };
    el._reset = () => { que = 0; clear(); }; el._reset();
  },
  // a tiny study planner: add tasks with a priority colour, click one to complete it, and see the JSON that gets saved
  plannerviz(el) {
    const P = { 'Red: Critical': 'red', 'Yellow: Caution': 'yellow', 'White: Regular': 'white' };
    let T, pr;
    el.innerHTML = `<p class="wgt">Try it: a tiny planner</p>
      <div class="wgrow"><label>task <input id="w-pl-t" maxlength="24" placeholder="Physics worksheet"></label></div>
      <div class="wgrow" id="w-pl-p">${Object.keys(P).map(n => `<button type="button" class="seg2" data-p="${n}">${n}</button>`).join('')}<button type="button" class="seg2 on" id="w-pl-a">Add task</button></div>
      <div class="plist" id="w-pl"></div>
      <figure class="code"><figcaption>saved as JSON</figcaption><pre><code id="w-pl-j"></code></pre></figure>`;
    const draw = () => {
      $$('#w-pl-p [data-p]').forEach(b => b.classList.toggle('pk', b.dataset.p === pr));
      $('#w-pl').innerHTML = T.length ? T.map((t, i) => `<div class="pr ${P[t.priority]}${t.done ? ' dn' : ''}" data-i="${i}"><u></u><span>${mdEsc(t.task)}</span><small>${t.done ? 'Completed' : 'Not Started'}</small><button type="button" data-x="${i}" title="Delete">x</button></div>`).join('') : '<p class="wgsay">No tasks yet.</p>';
      $('#w-pl-j').textContent = JSON.stringify({ tasks: T.map(t => ({ task: t.task, status: t.done ? 'Completed' : 'Not Started', priority: t.priority })) }, null, 2);
    };
    $('#w-pl-p').onclick = e => { const b = e.target.closest('[data-p]'); if (b) { pr = b.dataset.p; draw(); } };
    $('#w-pl-a').onclick = () => { const v = $('#w-pl-t').value.trim(); if (!v) { $('#w-pl-t').focus(); return; } T.push({ task: v, priority: pr, done: false }); $('#w-pl-t').value = ''; draw(); };
    $('#w-pl').onclick = e => { const x = e.target.closest('[data-x]'), r = e.target.closest('.pr'); if (x) T.splice(+x.dataset.x, 1); else if (r) T[+r.dataset.i].done = !T[+r.dataset.i].done; draw(); };
    el._reset = () => { T = [{ task: 'Python quiz', priority: 'Red: Critical', done: false }, { task: 'Read chapter 4', priority: 'White: Regular', done: false }]; pr = 'White: Regular'; $('#w-pl-t').value = ''; draw(); }; el._reset();
  },
  // type a strftime pattern and see today's date written that way
  timefmt(el) {
    const D = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const pad = (n, l = 2) => String(n).padStart(l, '0');
    const F = {
      Y: d => d.getFullYear(), y: d => pad(d.getFullYear() % 100), m: d => pad(d.getMonth() + 1), d: d => pad(d.getDate()),
      H: d => pad(d.getHours()), I: d => pad(d.getHours() % 12 || 12), M: d => pad(d.getMinutes()), S: d => pad(d.getSeconds()),
      p: d => d.getHours() < 12 ? 'AM' : 'PM', A: d => D[d.getDay()], a: d => D[d.getDay()].slice(0, 3), B: d => M[d.getMonth()], b: d => M[d.getMonth()].slice(0, 3),
      j: d => pad(Math.round((d - new Date(d.getFullYear(), 0, 0)) / 864e5), 3), '%': () => '%',
    };
    const presets = ['%Y-%m-%d %H:%M:%S', '%d/%m/%y', '%A %d %B %Y', '%I:%M %p', '%b %d'];
    el.innerHTML = `<p class="wgt">Try it: write a date format</p>
      <div class="wgrow"><label>format <input id="w-tf" value="${presets[0]}" maxlength="40" style="width:260px"></label></div>
      <div class="wgrow" id="w-tf-p">${presets.map(x => `<button type="button" class="seg2" data-f="${x}">${x}</button>`).join('')}</div>
      <figure class="code"><figcaption>python</figcaption><pre><code id="w-tf-c"></code></pre></figure>
      <p class="wgo">Prints: <b id="w-tf-o"></b></p>`;
    const run = () => {
      const f = $('#w-tf').value, now = new Date();
      $('#w-tf-c').innerHTML = mdCode(`from datetime import datetime\nprint(datetime.now().strftime("${f.replace(/"/g, '\\"')}"))`, 'python');
      $('#w-tf-o').textContent = f.replace(/%(.)/g, (m, c) => F[c] ? F[c](now) : m);
    };
    $('#w-tf').oninput = run;
    $('#w-tf-p').onclick = e => { const b = e.target.closest('button'); if (b) { $('#w-tf').value = b.dataset.f; run(); } };
    el._reset = () => { $('#w-tf').value = presets[0]; run(); }; run();
  },
  // type a path and see what os.path makes of it
  pathviz(el) {
    el.innerHTML = `<p class="wgt">Try it: split a path</p>
      <div class="wgrow"><label>path <input id="w-pv" value="data/images/cat01.png" maxlength="60" style="width:300px"></label></div>
      <div class="wgtable mono" id="w-pv-r"></div>`;
    const run = () => {
      const p = $('#w-pv').value, i = p.lastIndexOf('/'), base = p.slice(i + 1), dir = i < 0 ? '' : p.slice(0, i);
      const d = base.lastIndexOf('.'), root = d > 0 ? base.slice(0, d) : base, ext = d > 0 ? base.slice(d) : '';
      const row = (c, r) => `<div><code>${mdEsc(c)}</code><span class="ok">${mdEsc(r)}</span></div>`;
      $('#w-pv-r').innerHTML = row('os.path.basename(path)', `'${base}'`) + row('os.path.dirname(path)', `'${dir}'`)
        + row('os.path.splitext(path)', `('${dir ? dir + '/' : ''}${root}', '${ext}')`) + row('os.path.isabs(path)', /^\//.test(p) || /^[A-Za-z]:[\\/]/.test(p) ? 'True' : 'False');
    };
    $('#w-pv').oninput = run; el._reset = () => { $('#w-pv').value = 'data/images/cat01.png'; run(); }; run();
  },
  // type a command line and see the list sys.argv that the script receives
  argvviz(el) {
    el.innerHTML = `<p class="wgt">Try it: run a script</p>
      <div class="wgrow"><label>terminal <input id="w-av" value='python train.py --epochs 10 "my data.csv"' maxlength="80" style="width:360px"></label></div>
      <div class="wgtable mono" id="w-av-r"></div>`;
    const run = () => {
      const t = [...$('#w-av').value.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map(m => m[1] ?? m[2] ?? m[3]);
      const a = /^(python3?|py)$/.test(t[0] || '') ? t.slice(1) : t;
      const row = (c, r, bad) => `<div><code>${mdEsc(c)}</code><span class="${bad ? 'bad' : 'ok'}">${mdEsc(r)}</span></div>`;
      $('#w-av-r').innerHTML = row('sys.argv', '[' + a.map(x => `'${x}'`).join(', ') + ']') + row('len(sys.argv)', String(a.length))
        + (a.length ? row('sys.argv[0]', `'${a[0]}'  (the script itself)`) + row('sys.argv[1:]', '[' + a.slice(1).map(x => `'${x}'`).join(', ') + ']') : '')
        + row(`sys.argv[${a.length}]`, 'IndexError: list index out of range', true);
    };
    $('#w-av').oninput = run; el._reset = () => { $('#w-av').value = 'python train.py --epochs 10 "my data.csv"'; run(); }; run();
  },
  // a 3 x 4 NumPy array and what each common operation does to it
  arrayviz(el) {
    const A = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]], add = [10, 20, 30, 40];
    const sum = r => r.reduce((x, y) => x + y, 0);
    const ops = [
      ['a * 2', () => ({ g: A.map(r => r.map(v => v * 2)) })],
      ['a + [10, 20, 30, 40]', () => ({ g: A.map(r => r.map((v, j) => v + add[j])) })],
      ['a > 6', () => ({ g: A.map(r => r.map(v => v > 6)), b: 1 })],
      ['a[a > 6]', () => ({ row: A.flat().filter(v => v > 6) })],
      ['a[1, 2]', () => ({ val: A[1][2] })],
      ['a[:, 1]', () => ({ row: A.map(r => r[1]) })],
      ['a.sum()', () => ({ val: sum(A.flat()) })],
      ['a.sum(axis=0)', () => ({ row: add.map((_, j) => A.reduce((s, r) => s + r[j], 0)) })],
      ['a.sum(axis=1)', () => ({ row: A.map(sum) })],
      ['a.mean()', () => ({ val: sum(A.flat()) / 12 })],
      ['a.T', () => ({ g: add.map((_, j) => A.map(r => r[j])) })],
      ['a.shape', () => ({ val: '(3, 4)' })],
    ];
    const grid = (g, b) => `<div class="agrid" style="grid-template-columns:repeat(${g[0].length},auto)">${g.flat().map(v => `<i${b ? ` class="${v ? 't' : 'f'}"` : ''}>${b ? (v ? 'True' : 'False') : v}</i>`).join('')}</div>`;
    el.innerHTML = `<p class="wgt">Try it: do maths on an array</p>
      <figure class="code"><figcaption>python</figcaption><pre><code>${mdCode('a = np.arange(1, 13).reshape(3, 4)', 'python')}</code></pre></figure>
      <p class="wgsay">a is</p>${grid(A)}
      <div class="wgrow" id="w-ar-b">${ops.map((o, i) => `<button type="button" class="seg2${i ? '' : ' on'}" data-i="${i}">${mdEsc(o[0])}</button>`).join('')}</div>
      <p class="wgsay" id="w-ar-c"></p><div id="w-ar-o"></div>`;
    const run = i => {
      $$('#w-ar-b button').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
      const r = ops[i][1]();
      $('#w-ar-c').innerHTML = `<code>${mdEsc(ops[i][0])}</code> gives`;
      $('#w-ar-o').innerHTML = r.g ? grid(r.g, r.b) : r.row ? `<div class="agrid" style="grid-template-columns:repeat(${r.row.length},auto)">${r.row.map(v => `<i>${v}</i>`).join('')}</div>` : `<div class="agrid"><i>${r.val}</i></div>`;
    };
    $('#w-ar-b').onclick = e => { const b = e.target.closest('button'); if (b) run(+b.dataset.i); };
    el._reset = () => run(0); run(0);
  },
  // a small DataFrame (iris-style) and what filter, sort and groupby do to it
  dfviz(el) {
    const H = ['sepal_length', 'petal_length', 'species'];
    const R = [[5.1, 1.4, 'setosa'], [4.9, 1.4, 'setosa'], [4.7, 1.3, 'setosa'], [7.0, 4.7, 'versicolor'], [6.4, 4.5, 'versicolor'], [6.9, 4.9, 'versicolor'], [6.3, 6.0, 'virginica'], [5.8, 5.1, 'virginica'], [7.1, 5.9, 'virginica']];
    const full = idx => idx.map(i => [i, R[i][0].toFixed(1), R[i][1].toFixed(1), R[i][2]]);
    const all = R.map((_, i) => i), sp = ['setosa', 'versicolor', 'virginica'];
    const ops = [
      ['df', () => ({ h: ['', ...H], r: full(all) })],
      ['df["species"]', () => ({ h: ['', 'species'], r: all.map(i => [i, R[i][2]]) })],
      ['df[df["petal_length"] > 4.5]', () => ({ h: ['', ...H], r: full(all.filter(i => R[i][1] > 4.5)) })],
      ['df.sort_values("petal_length", ascending=False)', () => ({ h: ['', ...H], r: full([...all].sort((a, b) => R[b][1] - R[a][1])) })],
      ['df.groupby("species").mean()', () => ({ h: ['species', 'sepal_length', 'petal_length'], r: sp.map(s => { const g = R.filter(x => x[2] === s); return [s, (g.reduce((t, x) => t + x[0], 0) / g.length).toFixed(6), (g.reduce((t, x) => t + x[1], 0) / g.length).toFixed(6)]; }) })],
      ['df["species"].value_counts()', () => ({ h: ['species', 'count'], r: sp.map(s => [s, R.filter(x => x[2] === s).length]) })],
    ];
    el.innerHTML = `<p class="wgt">Try it: ask the table a question</p>
      <figure class="code"><figcaption>python</figcaption><pre><code>${mdCode('import pandas as pd\ndf = pd.read_csv("iris_small.csv")', 'python')}</code></pre></figure>
      <div class="tpj" id="w-df-b">${ops.map((o, i) => `<button type="button" class="tpb${i ? '' : ' on'}" data-i="${i}">${mdEsc(o[0])}</button>`).join('')}</div>
      <div class="dfw"><table class="dft" id="w-df"></table></div>`;
    const run = i => {
      $$('#w-df-b button').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
      const o = ops[i][1]();
      $('#w-df').innerHTML = `<tr>${o.h.map(x => `<th>${x}</th>`).join('')}</tr>` + o.r.map(r => `<tr>${r.map((v, k) => `<td${k ? '' : ' class="ix"'}>${v}</td>`).join('')}</tr>`).join('');
    };
    $('#w-df-b').onclick = e => { const b = e.target.closest('button'); if (b) run(+b.dataset.i); };
    el._reset = () => run(0); run(0);
  },
  // the same data drawn as a line, bars, dots or a histogram, in the same clean style as the MLP diagrams, with the data table and the matplotlib code
  plotbuilder(el) {
    const X = [1, 2, 3, 4, 5, 6], Y = [52, 58, 65, 70, 78, 85];
    const S = [48, 52, 55, 58, 60, 62, 64, 65, 66, 68, 70, 71, 73, 75, 78, 80, 84, 88, 90, 95];
    let kind = 'plot', lab = true, grid = true;
    const names = { plot: 'Line', bar: 'Bar', scatter: 'Scatter', hist: 'Histogram' };
    el.innerHTML = `<p class="wgt">Try it: pick a plot</p>
      <div class="wgrow" id="w-pb-k">${Object.keys(names).map(k => `<button type="button" class="seg2${k === 'plot' ? ' on' : ''}" data-k="${k}">${names[k]}</button>`).join('')}<button type="button" class="seg2 on" data-t="lab">Title and labels</button><button type="button" class="seg2 on" data-t="grid">Grid</button></div>
      <div class="nndiag" id="w-pb-s"></div>
      <div class="afrow" id="w-pb-t"></div>
      <figure class="code"><figcaption>python</figcaption><pre><code id="w-pb-o"></code></pre></figure>`;
    const draw = () => {
      const w = 480, h = 230, padL = 46, padR = 18, padT = lab ? 30 : 14, padB = lab ? 40 : 26;
      const x0 = padL, x1 = w - padR, y0 = h - padB, y1 = padT, hist = kind === 'hist';
      let xmin = 0.5, xmax = 6.5, ymax = 100, bins = [], lo = 0, bw = 0;
      if (hist) {
        lo = Math.min(...S); const hi = Math.max(...S); bw = (hi - lo) / 5; bins = Array(5).fill(0);
        S.forEach(v => bins[Math.min(4, Math.floor((v - lo) / bw))]++);
        xmin = lo; xmax = hi; ymax = Math.max(...bins) + 1;
      }
      const xAt = v => x0 + (v - xmin) / (xmax - xmin) * (x1 - x0), yAt = v => y0 - v / ymax * (y0 - y1);
      const yT = hist ? [...Array(ymax + 1).keys()].filter(v => v % 2 === 0) : [0, 20, 40, 60, 80, 100];
      const xT = hist ? [0, 1, 2, 3, 4, 5].map(i => +(lo + i * bw).toFixed(1)) : X;
      const gridL = grid ? xT.map(t => `<line x1="${xAt(t)}" y1="${y1}" x2="${xAt(t)}" y2="${y0}" stroke="var(--s0)"/>`).join('') + yT.map(t => `<line x1="${x0}" y1="${yAt(t)}" x2="${x1}" y2="${yAt(t)}" stroke="var(--s0)"/>`).join('') : '';
      const xl = xT.map(t => `<text x="${xAt(t)}" y="${y0 + 14}" text-anchor="middle" font-size="9" fill="var(--o0)">${t}</text>`).join('');
      const yl = yT.map(t => `<text x="${x0 - 8}" y="${yAt(t) + 3}" text-anchor="end" font-size="9" fill="var(--o0)">${t}</text>`).join('');
      let mark = '';
      if (kind === 'plot') mark = `<polyline points="${X.map((x, i) => `${xAt(x)},${yAt(Y[i])}`).join(' ')}" fill="none" stroke="var(--mauve)" stroke-width="1.5"/>`;
      if (kind === 'bar') mark = X.map((x, i) => `<rect x="${xAt(x - 0.4)}" y="${yAt(Y[i])}" width="${xAt(x + 0.4) - xAt(x - 0.4)}" height="${y0 - yAt(Y[i])}" fill="var(--mauve)" opacity=".85"/>`).join('');
      if (kind === 'scatter') mark = X.map((x, i) => `<circle cx="${xAt(x)}" cy="${yAt(Y[i])}" r="3.5" fill="var(--mauve)"/>`).join('');
      if (hist) mark = bins.map((n, i) => `<rect x="${xAt(lo + i * bw) + 1}" y="${yAt(n)}" width="${xAt(lo + (i + 1) * bw) - xAt(lo + i * bw) - 2}" height="${y0 - yAt(n)}" fill="var(--mauve)" opacity=".85"/>`).join('');
      const T = hist ? 'Spread of scores' : 'Score vs study hours', XL = hist ? 'Score' : 'Hours studied', YL = hist ? 'Students' : 'Score';
      const labels = lab ? `<text x="${(x0 + x1) / 2}" y="14" text-anchor="middle" font-size="11" fill="var(--text)">${T}</text>
        <text x="${(x0 + x1) / 2}" y="${h - 4}" text-anchor="middle" font-size="10" fill="var(--o1)">${XL}</text>
        <text x="12" y="${(y0 + y1) / 2}" text-anchor="middle" font-size="10" fill="var(--o1)" transform="rotate(-90 12 ${(y0 + y1) / 2})">${YL}</text>` : '';
      $('#w-pb-s').innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}">${gridL}
        <line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="var(--s1)"/><line x1="${x0}" y1="${y1}" x2="${x0}" y2="${y0}" stroke="var(--s1)"/>
        ${mark}${xl}${yl}${labels}</svg>`;
      $('#w-pb-t').innerHTML = hist
        ? bins.map((n, i) => `<div><span>${(lo + i * bw).toFixed(1)} to ${(lo + (i + 1) * bw).toFixed(1)}</span><small>students</small><b>${n}</b></div>`).join('')
        : X.map((x, i) => `<div><span>${x} ${x === 1 ? 'hour' : 'hours'}</span><small>score</small><b>${Y[i]}</b></div>`).join('');
      const data = hist ? 'scores = [48, 52, 55, ..., 95]    # 20 test scores' : 'x = [1, 2, 3, 4, 5, 6]\ny = [52, 58, 65, 70, 78, 85]';
      const call = hist ? 'plt.hist(scores, bins=5)' : `plt.${kind}(x, y)`;
      $('#w-pb-o').innerHTML = mdCode(`import matplotlib.pyplot as plt\n\n${data}\n\n${call}` + (lab ? `\nplt.title("${T}")\nplt.xlabel("${XL}")\nplt.ylabel("${YL}")` : '') + (grid ? '\nplt.grid(True)' : '') + '\nplt.show()', 'python');
    };
    $('#w-pb-k').onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.k) { kind = b.dataset.k; $$('#w-pb-k [data-k]').forEach(x => x.classList.toggle('on', x === b)); }
      else if (b.dataset.t === 'lab') { lab = !lab; b.classList.toggle('on', lab); } else { grid = !grid; b.classList.toggle('on', grid); }
      draw();
    };
    el._reset = () => { kind = 'plot'; lab = grid = true; $$('#w-pb-k button').forEach(x => x.classList.toggle('on', x.dataset.k === 'plot' || !!x.dataset.t)); draw(); }; draw();
  },
  // pick the error message you are seeing, get the cause and the fix
  errorfix(el) {
    const E = [
      ['No module named cv2 / mediapipe', 'The active Python environment has no packages installed.', 'Activate the project venv, then pip install opencv-python mediapipe==0.10.9 numpy.'],
      ['qt.qpa.xcb: could not connect to display', 'No DISPLAY is set, which is typical over SSH or a VS Code Remote terminal.', 'Run with DISPLAY=:0 and keep a screen-share (Pi Connect) or VNC session open. Or remove the cv.imshow calls to run headless.'],
      ['Aborted (core dumped) after a Qt error', 'The same display problem. Qt cannot find a screen, so the whole process aborts.', 'Fix the display first (DISPLAY=:0 plus an open screen session). It is not a separate bug.'],
      ['Could not open camera device at index 0', 'There is no /dev/video0: no camera is plugged in, or another program already has it open.', 'Check lsusb and ls /dev/video*. fuser /dev/video0 shows the process holding it, and kill <pid> frees it.'],
      ['No cameras available (rpicam-hello)', 'No CSI ribbon camera and no USB webcam were detected.', 'Plug in a USB webcam (lsusb should list a UVC device) or reseat the CSI ribbon cable.'],
      ['externally-managed-environment', 'Debian 12 and later blocks pip install into the system Python (PEP 668).', 'Activate the venv (or pyenv local 3.11.9) and pip install there. Only use --break-system-packages if you really mean to change the system Python.'],
      ['fatal error: Python.h: No such file', 'pip found no prebuilt wheel for your Python and tried to compile from source.', 'Usually the Python version is wrong: stay on 3.11.x for mediapipe==0.10.9. If you must build, sudo apt install python3-dev first.'],
      ['i2cdetect shows an empty grid', 'I2C is switched off, the bus number is wrong, or the LCD wiring or power is bad.', 'sudo raspi-config, Interface Options, I2C, Enable, reboot. Check ls /dev/i2c*, then the SDA, SCL and power wires.'],
      ['Servo drifts after the script ends', 'servo.stop() and GPIO.cleanup() stop the PWM pulses, so nothing drives the horn.', 'Expected with GPIO.PWM. Remove the final stop and cleanup if you want it to hold its last position.'],
      ['cv2 underlined red in VS Code', 'VS Code points at a different Python interpreter than the one with your packages.', 'Ctrl+Shift+P, Python: Select Interpreter, and pick the venv you installed into.'],
    ];
    el.innerHTML = `<p class="wgt">Try it: pick the error you see</p>
      <div class="tpj" id="w-ef-l">${E.map((e, i) => `<button type="button" class="tpb" data-i="${i}">${e[0]}</button>`).join('')}</div>
      <div class="tpres" id="w-ef"></div>`;
    const run = i => { $$('#w-ef-l button').forEach(b => b.classList.toggle('on', +b.dataset.i === i)); $('#w-ef').innerHTML = i < 0 ? '<p class="wgsay">Choose an error above.</p>' : `<b>Cause</b><p>${E[i][1]}</p><b>Fix</b><p>${E[i][2]}</p>`; };
    $('#w-ef-l').onclick = e => { const b = e.target.closest('button'); if (b) run(+b.dataset.i); };
    el._reset = () => run(-1); run(-1);
  },
  // wiring diagram: a bird's-eye view of the L298N board, with the Pi, the battery and the motor wired to it
  motorwiring(el) {
    const W = (d, c) => `<path d="${d}" fill="none" stroke="var(--${c})" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
    const D = (x, y, c) => `<circle cx="${x}" cy="${y}" r="3.6" fill="var(--${c})"/>`;
    const T = (x, y, t, c = 'var(--text)', s = 8, a = 'middle') => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${s}" fill="${c}">${t}</text>`;
    const edge = 'color-mix(in srgb,var(--lavender) 28%,var(--crust))', faint = 'color-mix(in srgb,var(--lavender) 22%,var(--crust))';
    const box = (x, y, w, h, r = 6, f = 'var(--crust)', s = edge) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" stroke="${s}"/>`;
    const screw = (x, y, c) => `<circle cx="${x}" cy="${y}" r="7" fill="var(--mantle)" stroke="var(--${c})" stroke-width="1.4"/><line x1="${x - 4}" y1="${y}" x2="${x + 4}" y2="${y}" stroke="var(--${c})"/>`;
    const hx = [286, 312, 338, 364, 390, 416];
    const svg = `<svg viewBox="0 0 640 400" width="100%">
      ${box(150, 8, 300, 50, 10)}${T(300, 25, 'Raspberry Pi', 'var(--text)', 10)}${T(262, 46, 'GPIO', 'var(--o1)', 7, 'end')}${T(286, 46, '13', 'var(--text)', 8)}${T(312, 46, '18', 'var(--text)', 8)}${T(338, 46, '12', 'var(--text)', 8)}${T(430, 46, 'GND', 'var(--o1)', 7)}
      ${box(470, 8, 150, 50, 10)}${T(545, 25, '2-cell lithium pack', 'var(--text)', 9)}${T(545, 38, '7.4 V (8.4 V full)', 'var(--o1)', 7)}
      ${box(180, 100, 380, 280, 14, 'var(--crust)', edge)}
      ${box(192, 112, 34, 46, 5)}${screw(209, 124, 'peach')}${screw(209, 146, 'peach')}${T(209, 172, 'OUT1', 'var(--text)', 7)}${T(209, 181, 'OUT2', 'var(--text)', 7)}${T(209, 191, 'motor A', 'var(--o1)', 6)}
      ${box(262, 108, 190, 18, 4)}${hx.map((x, i) => D(x, 117, i < 3 ? ['mauve', 'blue', 'teal'][i] : 'o0') + T(x, 140, ['ENA', 'IN1', 'IN2', 'IN3', 'IN4', 'ENB'][i], i < 3 ? 'var(--text)' : 'var(--o1)', 7)).join('')}
      ${box(470, 112, 82, 46, 5)}${screw(486, 124, 'o0')}${screw(512, 124, 'lavender')}${screw(538, 124, 'red')}${T(486, 172, '+5V', 'var(--o1)', 7)}${T(512, 172, 'GND', 'var(--text)', 7)}${T(538, 172, '+12V', 'var(--text)', 7)}
      ${box(520, 214, 32, 54, 5, 'var(--crust)', faint)}${screw(536, 228, 'o0')}${screw(536, 252, 'o0')}${T(536, 282, 'OUT3 OUT4', 'var(--o1)', 6)}
      ${[0, 1, 2, 3].map(i => box(194, 214 + i * 14, 18, 9, 2, 'var(--mantle)', faint) + box(528, 300 + i * 14, 18, 9, 2, 'var(--mantle)', faint)).join('')}
      ${box(250, 290, 130, 76, 6, 'var(--mantle)', edge)}${[0, 1, 2, 3, 4, 5, 6].map(i => `<line x1="${262 + i * 18}" y1="298" x2="${262 + i * 18}" y2="358" stroke="${faint}" stroke-width="3"/>`).join('')}${T(315, 332, 'L298N chip', 'var(--text)', 9)}${T(315, 344, 'on a heatsink', 'var(--o1)', 7)}
      ${W('M286 58 V117', 'mauve')}${W('M312 58 V117', 'blue')}${W('M338 58 V117', 'teal')}
      ${W('M430 58 V84 H512 V124', 'lavender')}
      ${W('M512 58 V124', 'lavender')}${D(512, 84, 'lavender')}
      ${W('M538 58 V124', 'red')}${box(520, 66, 36, 18, 5, 'var(--mantle)', 'var(--red)')}${T(538, 78, 'fuse', 'var(--red)', 7)}
      ${D(512, 58, 'lavender')}${D(538, 58, 'red')}${T(500, 54, '-', 'var(--text)', 11)}${T(550, 54, '+', 'var(--text)', 11)}
      <circle cx="78" cy="135" r="36" fill="var(--crust)" stroke="var(--peach)" stroke-width="2.4"/>${T(78, 146, 'M', 'var(--text)', 28)}${T(78, 187, 'DC motor', 'var(--o1)', 8)}
      ${W('M192 124 H112', 'peach')}${W('M192 146 H112', 'peach')}
    </svg>`;
    el.innerHTML = `<p class="wgt">Wiring diagram: the L298N from above</p>${svg}
      <div class="mwl"><span><i style="background:var(--red)"></i>battery + to +12V</span><span><i style="background:var(--lavender)"></i>battery - and Pi GND to GND</span><span><i style="background:var(--mauve)"></i>ENA (GPIO13)</span><span><i style="background:var(--blue)"></i>IN1 (GPIO18)</span><span><i style="background:var(--teal)"></i>IN2 (GPIO12)</span><span><i style="background:var(--peach)"></i>motor to OUT1, OUT2</span></div>`;
  },
  // dropout: the same small network with and without random neurons switched off
  dropoutdiagram(el) {
    const layers = [3, 5, 2], W = 280, H = 190;
    const xs = layers.map((_, i) => 40 + i * ((W - 80) / (layers.length - 1)));
    const ys = (n, k) => (H / (n + 1)) * (k + 1);
    el.innerHTML = `<p class="wgt">Try it: switch neurons off</p>
      <div class="wgrow"><label>Dropout rate <input id="w-dr" type="range" min="0" max="80" step="10" value="50"></label><b id="w-drv">50%</b>
      <button type="button" class="seg2" id="w-drr">Pick again</button></div>
      <div class="dropviz" id="w-drfig"></div>
      <p class="wgsay" id="w-drsay"></p>`;
    let off = new Set();
    const roll = () => {
      const r = +$('#w-dr').value / 100; off = new Set();
      for (let k = 0; k < layers[1]; k++) if (Math.random() < r) off.add(k);
      if (off.size === layers[1]) off.delete(0); // ponytail: always keep one neuron alive
    };
    const svg = drop => {
      let g = '', n = '';
      for (let l = 0; l < layers.length - 1; l++) for (let a = 0; a < layers[l]; a++) for (let b = 0; b < layers[l + 1]; b++) {
        const dead = drop && ((l === 0 && off.has(b)) || (l === 1 && off.has(a)));
        g += `<line x1="${xs[l]}" y1="${ys(layers[l], a)}" x2="${xs[l + 1]}" y2="${ys(layers[l + 1], b)}" stroke="var(--${dead ? 's0' : 'o0'})" stroke-width="1" opacity="${dead ? .5 : .6}"/>`;
      }
      layers.forEach((c, l) => { for (let k = 0; k < c; k++) {
        const x = xs[l], y = ys(c, k), dead = drop && l === 1 && off.has(k);
        n += dead ? `<circle cx="${x}" cy="${y}" r="9" fill="var(--s0)"/><path d="M${x - 4} ${y - 4}L${x + 4} ${y + 4}M${x + 4} ${y - 4}L${x - 4} ${y + 4}" stroke="var(--red)" stroke-width="2"/>`
                    : `<circle cx="${x}" cy="${y}" r="9" fill="var(--mauve)"/>`;
      } });
      return `<svg viewBox="0 0 ${W} ${H}" width="100%">${g}${n}</svg>`;
    };
    const paint = () => {
      $('#w-drv').textContent = $('#w-dr').value + '%';
      $('#w-drfig').innerHTML = `<figure><figcaption>Before (all active)</figcaption>${svg(false)}</figure><figure><figcaption>With ${$('#w-dr').value}% dropout</figcaption>${svg(true)}</figure>`;
      $('#w-drsay').textContent = `${off.size} of ${layers[1]} hidden neurons are off for this step. Next step, a different random set goes quiet.`;
    };
    $('#w-dr').oninput = () => { roll(); paint(); };
    $('#w-drr').onclick = () => { roll(); paint(); };
    roll(); paint();
  },
  // a simulated MNIST training run: scrub the epoch and watch loss, sample guesses and neuron weights change
  mnisttrainingreplay(el) {
    const digits = [6, 2, 3, 7, 2, 2, 3, 4, 7, 6];
    const trainLoss = e => 2.4 * Math.exp(-e / 10) + 0.01;
    const valLoss = e => 0.08 + 0.35 * Math.exp(-e / 18) + Math.max(0, e - 50) * 0.0015;
    el.innerHTML = `<p class="wgt">Try it: scrub the epoch</p>
      <div class="wgrow wgctl"><span class="mntabs" id="mn-tabs" style="display:inline-flex;gap:6px;margin:0">
        <button type="button" class="seg2 on" data-v="bird">Bird's Eye</button>
        <button type="button" class="seg2" data-v="neuron">Neuron Level</button>
        <button type="button" class="seg2" data-v="math">Math Level</button>
      </span><label>Epoch <input id="mn-e" type="range" min="1" max="100" value="1"><b class="wgv" id="mn-ev">1</b></label></div>
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
      $('#w-cmrows').innerHTML = row('accuracy = (TP+TN) / total', acc) + row('precision = TP / (TP+FP)', prec) + row('recall = TP / (TP+FN)', rec) + row('F1 = 2·pr·rc / (pr+rc)', f1);
    };
    el.addEventListener('input', run); run();
  },
  // a scatter of noisy points with a slope/intercept line you control, and the sum of squared error it produces
  // drag slope and intercept, or jump to the least-squares best fit
  linregfit(el) {
    const rnd = seeded(7);
    const pts = Array.from({ length: 12 }, (_, i) => { const x = i + 1; return { x, y: 2 * x + 3 + (rnd() * 2 - 1) * 3 }; });
    const n = pts.length, mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n;
    const bm = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / pts.reduce((s, p) => s + (p.x - mx) ** 2, 0), bb = my - bm * mx;
    const sseOf = (m, b) => pts.reduce((s, p) => s + (p.y - (m * p.x + b)) ** 2, 0), best = sseOf(bm, bb);
    el.innerHTML = `<p class="wgt">Try it: fit the line</p>
      <div class="tb"><label>slope (m) <input id="w-m" type="range" min="-1" max="5" step="0.05" value="1"><b class="wgv" id="w-mv"></b></label><label>intercept (b) <input id="w-b2" type="range" min="-10" max="20" step="0.5" value="0"><b class="wgv" id="w-bv"></b></label><button type="button" class="bt" id="w-best">Best fit</button></div>
      <div class="nndiag" id="w-lr"></div><p class="wgo">Sum of squared error = <b id="w-sse"></b> (the lowest any line can reach is <b>${best.toFixed(1)}</b>)</p>`;
    const run = () => {
      const m = +$('#w-m').value, b = +$('#w-b2').value;
      const xMin = 0, xMax = 13, yMin = -5, yMax = 35;
      $('#w-mv').textContent = m.toFixed(2); $('#w-bv').textContent = b.toFixed(1);
      $('#w-sse').innerHTML = sseOf(m, b).toFixed(1);
      const residuals = pts.map(p => ({ x1: p.x, y1: p.y, x2: p.x, y2: m * p.x + b, color: 'var(--s1)', w: 1, dash: '2 2' }));
      $('#w-lr').innerHTML = scatterSVG(pts, { xMin, xMax, yMin, yMax, xLabel: 'x', yLabel: 'y', lines: [{ x1: xMin, y1: m * xMin + b, x2: xMax, y2: m * xMax + b, color: 'var(--mauve)' }, ...residuals] });
    };
    $('#w-best').onclick = () => { $('#w-m').value = Math.round(bm / 0.05) * 0.05; $('#w-b2').value = Math.round(bb / 0.5) * 0.5; run(); };
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
  // a two-split decision tree you can walk down by changing the person's age and income
  decisiontree(el) {
    const q = (x, y, s, on) => `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="13" fill="${on ? 'var(--text)' : 'var(--o0)'}"${on ? ' font-weight="700"' : ''}>${s}</text>`;
    const leaf = (x, y, s, on) => `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="13" fill="${on ? 'var(--mauve)' : 'var(--o0)'}"${on ? ' font-weight="700"' : ''}>${s}</text>`;
    const edge = (x1, y1, x2, y2, label, on) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${on ? 'var(--mauve)' : 'var(--s1)'}" stroke-width="${on ? 2 : 1}"/><text x="${(x1 + x2) / 2 + (x2 < x1 ? -12 : 12)}" y="${(y1 + y2) / 2 + 3}" text-anchor="middle" font-size="10" fill="var(--o0)">${label}</text>`;
    el.innerHTML = `<p class="wgt">Try it: walk down the tree</p>
      <div class="tb"><label>Age <input id="dt-a" type="range" min="18" max="70" value="35"><b class="wgv" id="dt-av"></b></label><label>Income <input id="dt-i" type="range" min="10" max="120" step="5" value="40"><b class="wgv" id="dt-iv"></b></label></div>
      <svg id="dt-svg" viewBox="0 0 380 200" width="100%" height="200" style="max-width:420px;display:block;margin:6px auto"></svg>
      <p class="wgcap" id="dt-s"></p>`;
    const draw = () => {
      const age = +$('#dt-a').value, inc = +$('#dt-i').value, young = age < 30, low = inc < 50, ans = !young ? 'SUV' : low ? 'Hatchback' : 'Sedan';
      $('#dt-av').textContent = age; $('#dt-iv').textContent = inc + 'k';
      $('#dt-svg').innerHTML = edge(190, 30, 110, 76, 'yes', young) + edge(190, 30, 300, 76, 'no', !young) + edge(110, 106, 60, 152, 'yes', young && low) + edge(110, 106, 165, 152, 'no', young && !low)
        + q(190, 18, 'Age &lt; 30?', true) + q(110, 94, 'Income &lt; 50k?', young) + leaf(300, 94, 'SUV', ans === 'SUV') + leaf(60, 170, 'Hatchback', ans === 'Hatchback') + leaf(165, 170, 'Sedan', ans === 'Sedan');
      $('#dt-s').textContent = young ? `Age ${age} is under 30, so go left. Income ${inc}k is ${low ? 'under' : 'at least'} 50k, so the answer is ${ans}.` : `Age ${age} is not under 30, so go right. That leaf is the answer: ${ans}.`;
    };
    el.addEventListener('input', draw); draw();
  },
  // real k-means over three seeded blobs: pick K, step through the iterations, see how the total distance falls as K grows
  kmeanscluster(el) {
    const rnd = seeded(33), g = () => (rnd() + rnd() + rnd() - 1.5) * 1.5, pts = [];
    [[2.5, 2.5], [9, 3], [5.5, 8]].forEach(([cx, cy]) => { for (let i = 0; i < 8; i++) pts.push({ x: cx + g(), y: cy + g() }); });
    const order = pts.map((_, i) => [rnd(), i]).sort((a, b) => a[0] - b[0]).map(a => a[1]);
    const colors = ['var(--sky)', 'var(--peach)', 'var(--green)', 'var(--mauve)', 'var(--yellow)'];
    const d2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    // every K gets its own run of assign / update, stopping when nothing moves; inertia = total squared distance to the own centroid
    const runK = K => {
      let cs = order.slice(0, K).map(i => ({ x: pts[i].x, y: pts[i].y })); const snaps = [];
      for (let it = 0; it < 12; it++) {
        const a = pts.map(p => { let bi = 0, bd = Infinity; cs.forEach((c, i) => { const d = d2(p, c); if (d < bd) { bd = d; bi = i; } }); return bi; });
        snaps.push({ cs: cs.map(c => ({ ...c })), a, inertia: pts.reduce((s, p, j) => s + d2(p, cs[a[j]]), 0) });
        if (it && a.every((v, j) => v === snaps[it - 1].a[j])) break;
        cs = cs.map((c, i) => { const m = pts.filter((_, j) => a[j] === i); return m.length ? { x: m.reduce((s, p) => s + p.x, 0) / m.length, y: m.reduce((s, p) => s + p.y, 0) / m.length } : c; });
      }
      return snaps;
    };
    const runs = {}; [1, 2, 3, 4, 5, 6].forEach(K => runs[K] = runK(K));
    const Ks = [2, 3, 4, 5]; let ki = 1;
    const chip = Ks.map((k, i) => `<button type="button" class="bt${i === ki ? ' on' : ''}" data-i="${i}">${k}</button>`).join('');
    el.innerHTML = `<p class="wgt">Try it: pick K and step through k-means</p>
      <div class="tb"><span>K</span><span class="opts" id="km-k">${chip}</span><label>Iteration <input id="w-km" type="range" min="0" max="2" value="0"><b class="wgv" id="w-kmv"></b></label></div>
      <div class="nndiag" id="w-kmplot"></div><p class="wgcap" id="w-kmsay"></p><p class="wgcap" id="w-kmel"></p>`;
    const draw = () => {
      const K = Ks[ki], snaps = runs[K], inp = $('#w-km'); inp.max = snaps.length - 1;
      const it = Math.min(+inp.value, snaps.length - 1); inp.value = it; $('#w-kmv').textContent = it;
      const snap = snaps[it];
      const dots = pts.map((p, i) => ({ x: p.x, y: p.y, color: colors[snap.a[i]] })), cdots = snap.cs.map((c, i) => ({ x: c.x, y: c.y, color: colors[i], r: 8 }));
      $('#w-kmplot').innerHTML = scatterSVG([...dots, ...cdots], { xMin: -1, xMax: 13, yMin: -1, yMax: 11, xLabel: 'feature 1', yLabel: 'feature 2' });
      $('#w-kmsay').textContent = (it === 0 ? 'Iteration 0: the K centroids start on K random points, before any grouping has been improved.' : `Iteration ${it}: every point joined its nearest centroid (its colour), then each centroid moved to the average of its group.`)
        + ` Total squared distance to the own centroid: ${snap.inertia.toFixed(0)}.`;
      $('#w-kmel').textContent = 'Final total squared distance for K = 1 to 6: ' + [1, 2, 3, 4, 5, 6].map(k => runs[k][runs[k].length - 1].inertia.toFixed(0)).join(', ') + '. It always falls as K grows, and the sharp bend is where more groups stop helping.';
    };
    $('#km-k').onclick = e => { const b = e.target.closest('button'); if (!b) return; ki = +b.dataset.i; $$('#km-k button').forEach(x => x.classList.toggle('on', x === b)); draw(); };
    $('#w-km').oninput = draw;
    el._reset = () => { ki = 1; $('#w-km').value = 0; $$('#km-k button').forEach((b, k) => b.classList.toggle('on', k === 1)); draw(); };
    draw();
  },
  // real 2x2 PCA on seeded correlated data: turn the projection axis by hand and watch how much of the spread it keeps
  pcavariance(el) {
    const rnd = seeded(44);
    const raw = Array.from({ length: 30 }, () => { const x = rnd() * 10; return { x, y: 0.75 * x + (rnd() * 2 - 1) * 1.8 + 1 }; });
    const n = raw.length, mx = raw.reduce((s, p) => s + p.x, 0) / n, my = raw.reduce((s, p) => s + p.y, 0) / n;
    const pts = raw.map(p => ({ x: p.x - mx, y: p.y - my }));
    let a = 0, b = 0, d = 0;
    pts.forEach(p => { a += p.x * p.x; b += p.x * p.y; d += p.y * p.y; });
    a /= n; b /= n; d /= n;
    const tr = a + d, disc = Math.sqrt(Math.max(0, (tr / 2) ** 2 - (a * d - b * b))), l1 = tr / 2 + disc;
    const best = Math.round(((Math.atan2(l1 - a, b || 1e-9) * 180 / Math.PI) + 180) % 180);
    const keep = deg => { const t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t); return (a * c * c + 2 * b * c * s + d * s * s) / tr; };
    el.innerHTML = `<p class="wgt">Try it: find the direction that keeps the most spread</p>
      <div class="tb"><label>Axis angle <input id="pc-a" type="range" min="0" max="179" value="90"><b class="wgv" id="pc-av"></b></label><button type="button" class="bt" id="pc-best">Snap to PC1</button></div>
      <div class="nndiag" id="w-pca"></div><div class="afrow" id="pc-r"></div>
      <p class="wgcap">Each dot is dropped straight onto the axis (the short dashes). The orange dots on the axis are all the model keeps. PC1 is the angle where they stay most spread out.</p>`;
    const draw = () => {
      const deg = +$('#pc-a').value, t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), L = 6.5;
      const proj = pts.map(p => { const u = p.x * c + p.y * s; return { x: u * c, y: u * s }; });
      const lines = [{ x1: -L * c, y1: -L * s, x2: L * c, y2: L * s, color: 'var(--mauve)' }, ...pts.map((p, i) => ({ x1: p.x, y1: p.y, x2: proj[i].x, y2: proj[i].y, color: 'var(--s1)', w: 1, dash: '2 2' }))];
      $('#pc-av').textContent = deg + '°';
      $('#w-pca').innerHTML = scatterSVG([...pts.map(p => ({ ...p, color: 'var(--sky)' })), ...proj.map(p => ({ ...p, color: 'var(--peach)', r: 3 }))], { w: 360, h: 270, xMin: -6, xMax: 6, yMin: -4.4, yMax: 4.4, xTicksN: 5, yTicksN: 5, xLabel: 'feature 1 (centred)', yLabel: 'feature 2 (centred)', lines });
      $('#pc-r').innerHTML = `<div><span>This axis keeps</span><small>of the total spread</small><b>${(keep(deg) * 100).toFixed(1)}%</b></div><div><span>PC1 keeps</span><small>the most any axis can, at ${best}°</small><b>${(keep(best) * 100).toFixed(1)}%</b></div>`;
    };
    $('#pc-best').onclick = () => { $('#pc-a').value = best; draw(); };
    $('#pc-a').oninput = draw; draw();
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
  // RLHF with a real dial: the best policy under a KL penalty is  pi(y) ~ pi_base(y) * exp(reward(y) / beta).  Rewards and base odds are made up; the formula is the standard one.
  rlhfkl(el) {
    const R = [
      { k: 'A', text: 'So sorry about that! Here is a refund and a replacement on the way.', tag: 'really helpful', c: 'green', r: 8.4, p0: .30 },
      { k: 'B', text: 'Not my problem, try contacting someone else.', tag: 'curt', c: 'red', r: 1.2, p0: .35 },
      { k: 'C', text: 'Please contact our support team about your order.', tag: 'okay, but no help', c: 'yellow', r: 5.0, p0: .20 },
      { k: 'D', text: 'What a wonderful order! You are so right to be upset, you are amazing!', tag: 'empty flattery', c: 'peach', r: 9.0, p0: .15 },
    ];
    const beta = v => 0.4 * Math.pow(50, v / 100);      // slider 0..100 -> 0.4 .. 20 on a log scale
    el.innerHTML = `<p class="wgt">Try it: how far may the model move?</p>
      <p class="wgcap">A customer writes: "My order arrived broken." The base model could reply in four ways. The reward model has a blind spot: it over-rates flattery.</p>
      <div class="wgrow"><label>KL penalty (β) <input id="kl-b" type="range" min="0" max="100" value="55"></label><b id="kl-v"></b>
        <button type="button" class="seg2" data-s="0">Free</button><button type="button" class="seg2" data-s="55">Balanced</button><button type="button" class="seg2" data-s="100">Tight</button></div>
      <div class="klrows" id="kl-rows"></div>
      <div class="afrow" id="kl-st"></div>
`;
    const run = () => {
      const s = +$('#kl-b').value, bt = beta(s);
      const w = R.map(x => x.p0 * Math.exp(x.r / bt)), z = w.reduce((a, c) => a + c, 0), P = w.map(v => v / z);
      const kl = P.reduce((a, p, i) => a + (p > 0 ? p * Math.log(p / R[i].p0) : 0), 0), er = P.reduce((a, p, i) => a + p * R[i].r, 0);
      const pc = v => Math.round(v * 100) + '%';
      $('#kl-v').textContent = bt.toFixed(1);
      el.querySelectorAll('.seg2[data-s]').forEach(b => b.classList.toggle('on', Math.abs(+b.dataset.s - s) < 3));
      $('#kl-rows').innerHTML = R.map((x, i) => `<div class="klr"><div class="klt"><b style="color:var(--${x.c})">${x.k}</b><span>${mdEsc(x.text)}<small>${x.tag} · reward score ${x.r}</small></span></div>
        <div class="klb"><i style="width:${P[i] * 100}%;background:var(--${x.c})"></i><u style="left:${x.p0 * 100}%"></u></div><div class="kln"><b>${pc(P[i])}</b><small>base ${pc(x.p0)}</small></div></div>`).join('');
      $('#kl-st').innerHTML = `<div><span>Average reward</span><small>what the reward model says</small><b>${er.toFixed(1)}</b></div><div><span>Drift from base model</span><small>KL, in nats</small><b>${kl.toFixed(2)}</b></div><div><span>Flattering reply D</span><small>chance the model writes it</small><b>${pc(P[3])}</b></div>`;
    };
    $('#kl-b').oninput = run;
    el.querySelectorAll('.seg2[data-s]').forEach(b => b.onclick = () => { $('#kl-b').value = b.dataset.s; run(); });
    el._reset = () => { $('#kl-b').value = 55; run(); }; run();
  },
  // one neuron, one input of 1: nudge the weight and compare how a step output and a sigmoid output react
  stepsigmoid(el) {
    const step = z => z > 0 ? 1 : 0, sig = z => 1 / (1 + Math.exp(-z)), NUDGE = 0.1, cl = z => Math.max(-6, Math.min(6, z));
    el.innerHTML = `<p class="wgt">Try it: nudge the weight by +0.1 (peach = step, purple = sigmoid)</p>
      <div class="wgrow wgctl"><label>weight w <input id="w-ss-w" type="range" min="-4" max="4" step="0.01" value="-0.05"><b class="wgv" id="w-ss-wv"></b></label><label>bias b <input id="w-ss-b" type="range" min="-4" max="4" step="0.01" value="0"><b class="wgv" id="w-ss-bv"></b></label></div>
      <div class="nndiag" id="w-ss-plot"></div>
      <div class="wgtable" id="w-ss-rows"></div>
      <p class="wgcap" id="w-ss-say"></p>`;
    const grid = Array.from({ length: 121 }, (_, i) => -6 + i / 10);
    const run = () => {
      const w = +$('#w-ss-w').value, b = +$('#w-ss-b').value, z = w + b, z2 = z + NUDGE;
      $('#w-ss-wv').textContent = w.toFixed(2); $('#w-ss-bv').textContent = b.toFixed(2);
      $('#w-ss-plot').innerHTML = curveSVG([{ pts: grid.map(x => [x, step(x)]), color: 'var(--peach)' }, { pts: grid.map(x => [x, sig(x)]), color: 'var(--mauve)' }],
        { xMin: -6, xMax: 6, yMin: 0, yMax: 1, xLabel: 'z = w + b', yLabel: 'output', dots: [{ x: cl(z), y: step(z), color: 'var(--peach)' }, { x: cl(z), y: sig(z), color: 'var(--mauve)' }] });
      const d1 = step(z2) - step(z), d2 = sig(z2) - sig(z);
      $('#w-ss-rows').innerHTML = `<div class="afrow"><div><span>Step</span><small>${step(z)} → ${step(z2)}</small><b>change ${d1.toFixed(3)}</b></div><div><span>Sigmoid</span><small>${sig(z).toFixed(3)} → ${sig(z2).toFixed(3)}</small><b>change ${d2.toFixed(3)}</b></div></div>`;
      $('#w-ss-say').textContent = d1 ? 'The step output flipped from one end to the other for a 0.1 nudge. The sigmoid barely moved.' : 'Away from the jump the step output does not move at all, so it gives no hint which way to nudge. The sigmoid always moves a little.';
    };
    el.addEventListener('input', run);
    el._reset = () => { $('#w-ss-w').value = -0.05; $('#w-ss-b').value = 0; run(); };
    run();
  },
  // gradient descent on a one-weight cost C(w) = (w - 3)^2: choose the learning rate, step by hand, or add SGD's noise
  gdball(el) {
    const C = w => (w - 3) ** 2, dC = w => 2 * (w - 3), START = -0.5, cl = w => Math.max(-1, Math.min(7, w));
    let w, path, mode = 'full', rnd, timer;
    el.innerHTML = `<p class="wgt">Try it: roll the ball downhill</p>
      <div class="wgrow wgctl"><span id="w-gd-tabs" style="display:inline-flex;gap:6px"><button type="button" class="seg2 on" data-k="full">Exact</button><button type="button" class="seg2" data-k="sgd">Noisy (SGD)</button></span>
        <label>η <input id="w-gd-lr" type="range" min="0.02" max="1.1" step="0.01" value="0.1" style="width:110px"><b class="wgv" id="w-gd-lrv"></b></label>
        <button type="button" class="seg2" id="w-gd-step">Step</button><button type="button" class="seg2" id="w-gd-run">Run 25</button></div>
      <div class="nndiag" id="w-gd-plot"></div><p class="wgcap" id="w-gd-say"></p>`;
    const lr = () => +$('#w-gd-lr').value;
    const draw = () => {
      $('#w-gd-lrv').textContent = lr().toFixed(2);
      const curve = Array.from({ length: 81 }, (_, i) => [-1 + i / 10, C(-1 + i / 10)]);
      $('#w-gd-plot').innerHTML = curveSVG([{ pts: curve, color: 'var(--s1)' }, { pts: path.map(p => [cl(p), C(cl(p))]), color: 'var(--peach)', dash: '3 3' }],
        { xMin: -1, xMax: 7, yMin: 0, yMax: 18, xLabel: 'weight w', yLabel: 'cost C', dots: [{ x: cl(w), y: Math.min(18, C(cl(w))), color: 'var(--mauve)' }] });
      const gap = Math.abs(w - 3), n = path.length - 1;
      $('#w-gd-say').textContent = !isFinite(w) || gap > 9 ? 'Diverging: each step overshoots by more than it fixes, so the cost grows. The learning rate is too big.'
        : lr() >= 1 && n > 2 ? 'Bouncing from side to side across the bottom without settling. The learning rate is too big.'
        : n === 0 ? 'The ball starts at w = -0.5. Press Step.'
        : gap < 0.05 && mode === 'full' ? `Settled at w = ${w.toFixed(2)} after ${n} steps. The lowest cost is at w = 3.`
        : `Step ${n}: w = ${w.toFixed(2)}, cost = ${C(w).toFixed(2)}.` + (mode === 'sgd' ? ' The noisy gradient makes the path jitter, but it still drifts downhill.' : '');
    };
    const once = () => { w -= lr() * (dC(w) + (mode === 'sgd' ? (rnd() - 0.5) * 8 : 0)); path.push(w); };
    const reset = () => { clearInterval(timer); w = START; path = [START]; rnd = seeded(7); draw(); };
    $('#w-gd-lr').oninput = draw;
    $('#w-gd-step').onclick = () => { once(); draw(); };
    $('#w-gd-run').onclick = () => { clearInterval(timer); let n = 0; timer = trackTimer(setInterval(() => { once(); draw(); if (++n >= 25) clearInterval(timer); }, 150)); };
    $('#w-gd-tabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.k; $$('#w-gd-tabs button').forEach(t => t.classList.toggle('on', t === b)); reset(); };
    el._reset = () => { $('#w-gd-lr').value = 0.1; mode = 'full'; $$('#w-gd-tabs button').forEach(t => t.classList.toggle('on', t.dataset.k === 'full')); reset(); };
    reset();
  },
  // a cost landscape over two weights: a 3D surface (drag the angle), a top-down map and a 1D slice, with gradient descent rolling over it
  lossland3d(el) {
    const f = (x, y) => 0.12 * (x * x + y * y) - 1.6 * Math.exp(-((x - 1.5) ** 2 + (y - 1.5) ** 2) / 0.9) - 1.0 * Math.exp(-((x + 1.5) ** 2 + (y + 1) ** 2) / 0.9);
    const grad = (x, y, h = 1e-4) => [(f(x + h, y) - f(x - h, y)) / (2 * h), (f(x, y + h) - f(x, y - h)) / (2 * h)];
    const settle = (x, y) => { for (let i = 0; i < 800; i++) { const [gx, gy] = grad(x, y); x -= 0.1 * gx; y -= 0.1 * gy; } return [x, y]; };
    const G = settle(1.5, 1.5), L = settle(-1.5, -1), R = 3, N = 26, FMIN = -1.2, FMAX = 2.2;
    const starts = { A: [-2.5, -2.5], B: [2.5, 2.5], C: [-2.5, 2.5] }, near = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.4;
    let start = 'A', mode = 'gd', view = '3d', p, v, path, timer;
    // pastel ramp: low = periwinkle, middle = pink, high = peach; the lower lightness at the bottom keeps the valleys readable
    const col = z => { const t = Math.max(0, Math.min(1, (z - FMIN) / (FMAX - FMIN))); return `hsl(${250 + 130 * t},${55 + 10 * t}%,${42 + 42 * t}%)`; };
    el.innerHTML = `<p class="wgt">Try it: roll a ball over a cost landscape of two weights</p>
      <div class="wgrow wgctl"><span id="w-ll-view" style="display:inline-flex;gap:6px"><button type="button" class="seg2 on" data-k="3d">3D</button><button type="button" class="seg2" data-k="top">Map</button><button type="button" class="seg2" data-k="slice">Slice</button></span>
        <span id="w-ll-start" style="display:inline-flex;gap:6px"><button type="button" class="seg2 on" data-s="A">Start A</button><button type="button" class="seg2" data-s="B">B</button><button type="button" class="seg2" data-s="C">C</button></span>
        <span id="w-ll-mode" style="display:inline-flex;gap:6px"><button type="button" class="seg2 on" data-m="gd">Plain GD</button><button type="button" class="seg2" data-m="mom">Momentum</button></span></div>
      <div class="wgrow wgctl"><label>η <input id="w-ll-lr" type="range" min="0.02" max="0.4" step="0.01" value="0.1" style="width:100px"><b class="wgv" id="w-ll-lrv"></b></label><label>turn <input id="w-ll-yaw" type="range" min="0" max="360" step="1" value="290" style="width:100px"><b class="wgv" id="w-ll-yawv"></b></label><label>tilt <input id="w-ll-tilt" type="range" min="25" max="80" step="1" value="48" style="width:100px"><b class="wgv" id="w-ll-tiltv"></b></label>
        <button type="button" class="seg2" id="w-ll-step">Step</button><button type="button" class="seg2" id="w-ll-run">Run 120</button></div>
      <div class="nndiag" id="w-ll-plot"></div><p class="wgcap" id="w-ll-say"></p>`;
    const draw = () => {
      const lr = +$('#w-ll-lr').value, th = +$('#w-ll-yaw').value * Math.PI / 180, ph = +$('#w-ll-tilt').value * Math.PI / 180, cs = Math.cos(th), sn = Math.sin(th);
      $('#w-ll-lrv').textContent = lr.toFixed(2); $('#w-ll-yawv').textContent = $('#w-ll-yaw').value + '°'; $('#w-ll-tiltv').textContent = $('#w-ll-tilt').value + '°';
      let oy = 0; // vertical shift that keeps the surface centred in the frame whatever the tilt
      const px = (x, y, z) => { const rx = x * cs - y * sn, ry = x * sn + y * cs; return [200 + rx * 34, oy + ry * Math.sin(ph) * 34 - z * Math.cos(ph) * 36, ry]; };
      if (view === '3d') { const ys = [px(...G, FMIN - 0.5)[1] + 14, px(...L, FMIN - 0.5)[1] + 14, px(...G, f(...G))[1] - 28, px(...L, f(...L))[1] - 28]; for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) ys.push(px(-R + i * 0.75, -R + j * 0.75, f(-R + i * 0.75, -R + j * 0.75))[1]); oy = 160 - (Math.min(...ys) + Math.max(...ys)) / 2; }
      const pt = ([x, y], dz = 0.06) => px(x, y, f(x, y) + dz);
      let svg = '';
      if (view === '3d') {
        const quads = [], s = 2 * R / (N - 1);
        for (let i = 0; i < N - 1; i++) for (let j = 0; j < N - 1; j++) {
          const xs = [-R + i * s, -R + (i + 1) * s], ys = [-R + j * s, -R + (j + 1) * s];
          const c = [[xs[0], ys[0]], [xs[1], ys[0]], [xs[1], ys[1]], [xs[0], ys[1]]].map(([x, y]) => px(x, y, f(x, y)));
          const zm = (f(xs[0], ys[0]) + f(xs[1], ys[1])) / 2;
          quads.push({ d: (c[0][2] + c[2][2]) / 2, pts: c.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '), fill: col(zm) });
        }
        quads.sort((a, b) => a.d - b.d);
        svg = `<svg viewBox="0 0 400 320" width="100%" height="320">${quads.map(q => `<polygon points="${q.pts}" fill="${q.fill}" stroke="rgba(0,0,0,.22)" stroke-width=".5"/>`).join('')}
          <polyline points="${path.map(q => pt(q).slice(0, 2).map(n => n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="var(--text)" stroke-width="1.5"/>
          ${[[G, 'global min (lowest)', 'var(--green)'], [L, 'local min', 'var(--peach)']].map(([m, t, c]) => { const q = pt(m, 0.05), d = px(m[0], m[1], FMIN - 0.5); return `<line x1="${q[0]}" y1="${q[1]}" x2="${d[0]}" y2="${d[1]}" stroke="${c}" stroke-dasharray="3 3"/><circle cx="${q[0]}" cy="${q[1]}" r="5" fill="none" stroke="${c}" stroke-width="2"/><text x="${q[0]}" y="${q[1] - 12}" text-anchor="middle" font-size="10" fill="${c}">${t}</text><text x="${d[0]}" y="${d[1] + 12}" text-anchor="middle" font-size="10" fill="${c}">cost ${f(m[0], m[1]).toFixed(2)}</text>`; }).join('')}
          <circle cx="${pt(p, 0.1)[0]}" cy="${pt(p, 0.1)[1]}" r="5.5" fill="var(--yellow)" stroke="var(--crust)" stroke-width="1.5"/></svg>`;
      } else if (view === 'top') {
        const M = 40, s = 2 * R / M, a = x => (x + R) / (2 * R) * 300;
        let cells = ''; for (let i = 0; i < M; i++) for (let j = 0; j < M; j++) cells += `<rect x="${i * 7.5}" y="${j * 7.5}" width="7.6" height="7.6" fill="${col(f(-R + (i + .5) * s, -R + (j + .5) * s))}"/>`;
        svg = `<svg id="w-ll-top" viewBox="0 0 300 300" width="100%" height="300" style="cursor:crosshair;max-width:420px">${cells}
          <polyline points="${path.map(q => a(q[0]).toFixed(1) + ',' + a(q[1]).toFixed(1)).join(' ')}" fill="none" stroke="var(--text)" stroke-width="1.5"/>
          ${[[G, 'global min (lowest)', 'var(--green)'], [L, 'local min', 'var(--peach)']].map(([m, t, c]) => `<circle cx="${a(m[0])}" cy="${a(m[1])}" r="6" fill="none" stroke="${c}" stroke-width="2"/><text x="${a(m[0])}" y="${a(m[1]) - 10}" text-anchor="middle" font-size="10" fill="${c}">${t}</text>`).join('')}
          <circle cx="${a(p[0])}" cy="${a(p[1])}" r="5" fill="var(--yellow)" stroke="var(--crust)" stroke-width="1.5"/></svg>`;
      } else {
        const T0 = -0.4, T1 = 1.4, at = t => [L[0] + t * (G[0] - L[0]), L[1] + t * (G[1] - L[1])], F = t => f(...at(t));
        let tr = 0.5; for (let t = 0; t <= 1; t += 0.01) if (F(t) > F(tr)) tr = t;
        svg = curveSVG([{ pts: Array.from({ length: 91 }, (_, i) => [T0 + i * 0.02, F(T0 + i * 0.02)]), color: 'var(--mauve)' }],
          { xMin: T0, xMax: T1, yMin: -1.3, yMax: 1.6, xLabel: 'position along the straight line from the local min to the global min', yLabel: 'cost', dots: [{ x: 0, y: F(0), label: 'local min', color: 'var(--peach)' }, { x: 1, y: F(1), label: 'global min', color: 'var(--green)' }, { x: tr, y: F(tr), label: 'ridge between', color: 'var(--yellow)' }] });
      }
      $('#w-ll-plot').innerHTML = svg;
      const gm = Math.hypot(...grad(...p)), n = path.length - 1, c = f(...p).toFixed(2);
      $('#w-ll-say').textContent = view === 'slice' ? 'A slice cuts straight through the landscape along one line. Both valleys show as dips. The deeper one is the global minimum, and the bump between them is a ridge: gradient descent in a valley cannot climb it.'
        : gm < 0.02 ? (near(p, G) ? `Global minimum: the lowest point on the whole landscape (cost ${c}).` : near(p, L) ? `Local minimum: a valley, but not the lowest one (cost ${c}, while the global minimum is ${f(...G).toFixed(2)}). Every direction from here goes uphill, so gradient descent stops, even though a better answer exists.` : `Stopped on a flat spot (cost ${c}).`)
        : n === 0 ? 'The yellow ball starts here. Press Step or Run. The lines are the path it takes.'
        : gm < 0.08 && n > 15 ? `Step ${n}: almost no slope here, so progress is very slow. This is a plateau or a saddle: flat in one direction, and not yet a minimum.` : `Step ${n}: cost ${c}, slope ${gm.toFixed(2)}.`;
      if (view === 'top') { const sv = $('#w-ll-top'); sv.onclick = e => { const r = sv.getBoundingClientRect(); start = null; $$('#w-ll-start button').forEach(b => b.classList.remove('on')); reset([(e.clientX - r.left) / r.width * 2 * R - R, (e.clientY - r.top) / r.height * 2 * R - R]); }; }
    };
    const reset = at => { clearInterval(timer); p = (at || starts[start]).slice(); v = [0, 0]; path = [p.slice()]; draw(); };
    const once = () => { const [gx, gy] = grad(...p), b = mode === 'mom' ? 0.9 : 0, lr = +$('#w-ll-lr').value; v = [b * v[0] + gx, b * v[1] + gy]; p = [p[0] - lr * v[0], p[1] - lr * v[1]]; path.push(p.slice()); };
    $('#w-ll-view').onclick = e => { const b = e.target.closest('button'); if (!b) return; view = b.dataset.k; $$('#w-ll-view button').forEach(t => t.classList.toggle('on', t === b)); draw(); };
    $('#w-ll-start').onclick = e => { const b = e.target.closest('button'); if (!b) return; start = b.dataset.s; $$('#w-ll-start button').forEach(t => t.classList.toggle('on', t === b)); reset(); };
    $('#w-ll-mode').onclick = e => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; $$('#w-ll-mode button').forEach(t => t.classList.toggle('on', t === b)); reset(start ? undefined : path[0]); };
    $('#w-ll-lr').oninput = draw; $('#w-ll-yaw').oninput = draw; $('#w-ll-tilt').oninput = draw;
    $('#w-ll-step').onclick = () => { once(); draw(); };
    $('#w-ll-run').onclick = () => { clearInterval(timer); let n = 0; timer = trackTimer(setInterval(() => { once(); draw(); if (++n >= 120) clearInterval(timer); }, 60)); };
    el._reset = () => { view = '3d'; mode = 'gd'; start = 'A'; $('#w-ll-lr').value = 0.1; $('#w-ll-yaw').value = 290; $('#w-ll-tilt').value = 48; $$('#w-ll-view button').forEach(t => t.classList.toggle('on', t.dataset.k === '3d')); $$('#w-ll-start button').forEach(t => t.classList.toggle('on', t.dataset.s === 'A')); $$('#w-ll-mode button').forEach(t => t.classList.toggle('on', t.dataset.m === 'gd')); reset(); };
    reset();
  },
  // one sigmoid neuron that must output 0: the same gradient descent, once with quadratic cost and once with cross-entropy
  costcompare(el) {
    const sig = z => 1 / (1 + Math.exp(-z)), EP = 300, starts = { 'Mildly wrong': [0.6, 0.9], 'Badly wrong': [2, 2] };
    let which = 'Badly wrong';
    el.innerHTML = `<p class="wgt">Try it: same neuron, same target 0, two cost functions (peach = quadratic, purple = cross-entropy)</p>
      <div class="wgrow wgctl"><span id="w-cc-tabs" style="display:inline-flex;gap:6px"></span>
        <label>η <input id="w-cc-eta" type="range" min="0.05" max="0.5" step="0.01" value="0.15" style="width:110px"><b class="wgv" id="w-cc-etav"></b></label></div>
      <div class="nndiag" id="w-cc-plot"></div><div class="wgtable" id="w-cc-rows"></div>`;
    $('#w-cc-tabs').innerHTML = Object.keys(starts).map(n => `<button type="button" class="seg2${n === which ? ' on' : ''}" data-k="${n}">${n}</button>`).join('');
    // x = 1 and target y = 0, so the gradient is a·σ′(z) = a²(1−a) for quadratic cost and just a for cross-entropy
    const sim = (eta, ce) => { let [w, b] = starts[which]; const out = []; for (let t = 0; t <= EP; t++) { const a = sig(w + b); out.push([t, a]); const g = ce ? a : a * a * (1 - a); w -= eta * g; b -= eta * g; } return out; };
    const run = () => {
      const eta = +$('#w-cc-eta').value; $('#w-cc-etav').textContent = eta.toFixed(2);
      $$('#w-cc-tabs button').forEach(t => t.classList.toggle('on', t.dataset.k === which));
      const q = sim(eta, false), c = sim(eta, true), half = s => { const i = s.findIndex(p => p[1] < 0.5); return i < 0 ? `not within ${EP} epochs` : `epoch ${i}`; };
      $('#w-cc-plot').innerHTML = curveSVG([{ pts: q, color: 'var(--peach)' }, { pts: c, color: 'var(--mauve)' }], { xMin: 0, xMax: EP, yMin: 0, yMax: 1, xLabel: 'epoch', yLabel: 'output a (target 0)' });
      $('#w-cc-rows').innerHTML = `<div class="afrow"><div><span>Quadratic</span><small>output below 0.5 at</small><b>${half(q)}</b></div><div><span>Cross-entropy</span><small>output below 0.5 at</small><b>${half(c)}</b></div></div>`;
    };
    $('#w-cc-tabs').onclick = e => { const b = e.target.closest('button'); if (b) { which = b.dataset.k; run(); } };
    $('#w-cc-eta').oninput = run;
    el._reset = () => { which = 'Badly wrong'; $('#w-cc-eta').value = 0.15; run(); };
    run();
  },
  // fill in the blanks of an f-string and watch the sentence change
  fstring(el) {
    el.innerHTML = `<p class="wgt">Try it: fill in the blanks</p>
      <div class="wgrow"><label>name <input id="w-name" value="Falcons" maxlength="14"></label><label>score <input id="w-score" type="number" value="95"></label></div>
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
  document.documentElement.dataset.cls = (id || '').split('/')[0]; // lets the stylesheet treat one class (like ai-development) differently
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
  lessonEl.dataset.cls = slug(entry.g);
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
  $$('[data-widget]').forEach(el => { const f = widgets[el.dataset.widget]; if (f) { f(el); addReset(el); } });
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
