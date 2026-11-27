/* Playground: neural-net sandbox.
   The simulation (nn, datasets, training loop, loss) is ported from TensorFlow Playground,
   Copyright 2016 Google Inc., Apache License 2.0 (https://github.com/tensorflow/playground).
   The interface and drawing are our own: plain DOM/SVG/canvas, no d3, no build step. */
(() => {
'use strict';

/* ---------- nn (from src/nn.ts) ---------- */
const ACT = {
  tanh: { out: Math.tanh, der: x => { const o = Math.tanh(x); return 1 - o * o } },
  relu: { out: x => Math.max(0, x), der: x => x <= 0 ? 0 : 1 },
  sigmoid: { out: x => 1 / (1 + Math.exp(-x)), der: x => { const o = 1 / (1 + Math.exp(-x)); return o * (1 - o) } },
  linear: { out: x => x, der: () => 1 },
};
const REG = {
  none: null,
  L1: { der: w => w < 0 ? -1 : w > 0 ? 1 : 0 },
  L2: { der: w => w },
};
const sqErr = (o, t) => 0.5 * (o - t) ** 2;

class Node {
  constructor(id, act, initZero) {
    this.id = id; this.act = act; this.bias = initZero ? 0 : 0.1;
    this.inLinks = []; this.outLinks = [];
    this.totalInput = 0; this.output = 0; this.outputDer = 0; this.inputDer = 0; this.accInputDer = 0; this.nAcc = 0;
  }
  update() {
    let s = this.bias;
    for (const l of this.inLinks) s += l.weight * l.source.output;
    this.totalInput = s;
    return this.output = this.act.out(s);
  }
}
class Link {
  constructor(source, dest, reg, initZero) {
    this.source = source; this.dest = dest; this.reg = reg;
    this.weight = initZero ? 0 : Math.random() - 0.5;
    this.dead = false; this.errorDer = 0; this.accErrorDer = 0; this.nAcc = 0;
  }
}
function buildNetwork(shape, act, outAct, reg, inputIds, initZero) {
  let id = 1;
  const net = [];
  shape.forEach((n, li) => {
    const layer = []; net.push(layer);
    for (let i = 0; i < n; i++) {
      const node = new Node(li === 0 ? inputIds[i] : String(id++), li === shape.length - 1 ? outAct : act, initZero);
      layer.push(node);
      if (li > 0) for (const prev of net[li - 1]) {
        const link = new Link(prev, node, reg, initZero);
        prev.outLinks.push(link); node.inLinks.push(link);
      }
    }
  });
  return net;
}
function forwardProp(net, inputs) {
  net[0].forEach((n, i) => n.output = inputs[i]);
  for (let l = 1; l < net.length; l++) for (const n of net[l]) n.update();
  return net[net.length - 1][0].output;
}
function backProp(net, target) {
  const out = net[net.length - 1][0];
  out.outputDer = out.output - target;
  for (let l = net.length - 1; l >= 1; l--) {
    for (const n of net[l]) {
      n.inputDer = n.outputDer * n.act.der(n.totalInput);
      n.accInputDer += n.inputDer; n.nAcc++;
    }
    for (const n of net[l]) for (const k of n.inLinks) {
      if (k.dead) continue;
      k.errorDer = n.inputDer * k.source.output;
      k.accErrorDer += k.errorDer; k.nAcc++;
    }
    if (l === 1) continue;
    for (const n of net[l - 1]) {
      n.outputDer = 0;
      for (const k of n.outLinks) n.outputDer += k.weight * k.dest.inputDer;
    }
  }
}
function updateWeights(net, lr, regRate) {
  for (let l = 1; l < net.length; l++) for (const n of net[l]) {
    if (n.nAcc > 0) { n.bias -= lr * n.accInputDer / n.nAcc; n.accInputDer = 0; n.nAcc = 0 }
    for (const k of n.inLinks) {
      if (k.dead || k.nAcc <= 0) continue;
      k.weight -= (lr / k.nAcc) * k.accErrorDer;
      const nw = k.weight - lr * regRate * (k.reg ? k.reg.der(k.weight) : 0);
      if (k.reg === REG.L1 && k.weight * nw < 0) { k.weight = 0; k.dead = true } else k.weight = nw;
      k.accErrorDer = 0; k.nAcc = 0;
    }
  }
}

/* ---------- datasets (from src/dataset.ts) ---------- */
const rnd = (a, b) => Math.random() * (b - a) + a;
const gauss = (mean, variance) => {
  let v1, v2, s;
  do { v1 = 2 * Math.random() - 1; v2 = 2 * Math.random() - 1; s = v1 * v1 + v2 * v2 } while (s > 1);
  return mean + Math.sqrt(variance) * Math.sqrt(-2 * Math.log(s) / s) * v1;
};
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lin = (d0, d1, r0, r1, clamp) => v => { let t = (v - d0) / (d1 - d0); if (clamp) t = Math.min(1, Math.max(0, t)); return r0 + t * (r1 - r0) };

const DATA = {
  circle(n, noise) {
    const pts = [], R = 5, lab = (x, y) => Math.hypot(x, y) < R * 0.5 ? 1 : -1;
    for (const [lo, hi] of [[0, R * 0.5], [R * 0.7, R]]) for (let i = 0; i < n / 2; i++) {
      const r = rnd(lo, hi), a = rnd(0, 2 * Math.PI), x = r * Math.sin(a), y = r * Math.cos(a);
      pts.push({ x, y, label: lab(x + rnd(-R, R) * noise, y + rnd(-R, R) * noise) });
    }
    return pts;
  },
  xor(n, noise) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      let x = rnd(-5, 5), y = rnd(-5, 5);
      x += x > 0 ? 0.3 : -0.3; y += y > 0 ? 0.3 : -0.3;
      pts.push({ x, y, label: (x + rnd(-5, 5) * noise) * (y + rnd(-5, 5) * noise) >= 0 ? 1 : -1 });
    }
    return pts;
  },
  gauss(n, noise) {
    const pts = [], v = lin(0, 0.5, 0.5, 4)(noise);
    for (const [c, label] of [[2, 1], [-2, -1]]) for (let i = 0; i < n / 2; i++) pts.push({ x: gauss(c, v), y: gauss(c, v), label });
    return pts;
  },
  spiral(n, noise) {
    const pts = [], h = n / 2;
    for (const [d, label] of [[0, 1], [Math.PI, -1]]) for (let i = 0; i < h; i++) {
      const r = i / h * 5, t = 1.75 * i / h * 2 * Math.PI + d;
      pts.push({ x: r * Math.sin(t) + rnd(-1, 1) * noise, y: r * Math.cos(t) + rnd(-1, 1) * noise, label });
    }
    return pts;
  },
  'reg-plane'(n, noise) {
    const pts = [], R = 6, f = lin(-10, 10, -1, 1);
    for (let i = 0; i < n; i++) {
      const x = rnd(-R, R), y = rnd(-R, R);
      pts.push({ x, y, label: f(x + rnd(-R, R) * noise + y + rnd(-R, R) * noise) });
    }
    return pts;
  },
  'reg-gauss'(n, noise) {
    const pts = [], R = 6, f = lin(0, 2, 1, 0, true);
    const G = [[-4, 2.5, 1], [0, 2.5, -1], [4, 2.5, 1], [-4, -2.5, -1], [0, -2.5, 1], [4, -2.5, -1]];
    const label = (x, y) => { let l = 0; for (const [cx, cy, s] of G) { const v = s * f(dist({ x, y }, { x: cx, y: cy })); if (Math.abs(v) > Math.abs(l)) l = v } return l };
    for (let i = 0; i < n; i++) {
      const x = rnd(-R, R), y = rnd(-R, R);
      pts.push({ x, y, label: label(x + rnd(-R, R) * noise, y + rnd(-R, R) * noise) });
    }
    return pts;
  },
};
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } };

/* ---------- inputs ---------- */
const FEATURES = [
  ['x', 'X1', (x) => x], ['y', 'X2', (x, y) => y],
  ['xSquared', 'X1²', x => x * x], ['ySquared', 'X2²', (x, y) => y * y],
  ['xTimesY', 'X1X2', (x, y) => x * y],
  ['sinX', 'sin(X1)', x => Math.sin(x)], ['sinY', 'sin(X2)', (x, y) => Math.sin(y)],
];
const F = Object.fromEntries(FEATURES.map(([id, label, f]) => [id, { label, f }]));

/* ---------- state ---------- */
const NS_CLASS = 500, NS_REG = 1200, DENS = 100, XD = 6;
const S = {
  problem: 'classification', dataset: 'circle', regDataset: 'reg-plane',
  activation: 'tanh', regularization: 'none', regRate: 0, lr: 0.03,
  noise: 0, batch: 10, train: 50, showTest: false, discretize: false,
  shape: [4, 2], on: { x: true, y: true }, maxEpochs: 0, speed: 1, weights: true,
};
let net, trainData = [], testData = [], iter = 0, lossTrain = 0, lossTest = 0, hoverNode = null, raf = 0, grid = {};
const hist = { train: [], test: [] };

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const activeIds = () => FEATURES.map(f => f[0]).filter(id => S.on[id]);
const inputOf = (x, y) => activeIds().map(id => F[id].f(x, y));

/* ---------- colours: Catppuccin diverging peach / surface / blue ---------- */
const C_NEG = [250, 179, 135], C_MID = [69, 71, 90], C_POS = [137, 180, 250];
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const color = v => { v = Math.max(-1, Math.min(1, v)); const c = v < 0 ? mix(C_MID, C_NEG, -v) : mix(C_MID, C_POS, v); return `rgb(${c})` };
const rgbOf = v => { v = Math.max(-1, Math.min(1, v)); return v < 0 ? mix(C_MID, C_NEG, -v) : mix(C_MID, C_POS, v) };

/* ---------- data + network ---------- */
function generate() {
  const reg = S.problem === 'regression';
  const data = DATA[reg ? S.regDataset : S.dataset](reg ? NS_REG : NS_CLASS, S.noise / 100);
  shuffle(data);
  const k = Math.floor(data.length * S.train / 100);
  trainData = data.slice(0, k); testData = data.slice(k);
}
const getLoss = pts => { let s = 0; for (const p of pts) s += sqErr(forwardProp(net, inputOf(p.x, p.y)), p.label); return s / pts.length };

function reset() {
  stop();
  iter = 0; hist.train = []; hist.test = [];
  if (!activeIds().length) S.on.x = true;
  const shape = [activeIds().length, ...S.shape, 1];
  net = buildNetwork(shape, ACT[S.activation], S.problem === 'regression' ? ACT.linear : ACT.tanh, REG[S.regularization], activeIds(), false);
  lossTrain = getLoss(trainData); lossTest = getLoss(testData);
  buildNet(); refresh(true);
}

function trainEpoch() {
  iter++;
  trainData.forEach((p, i) => {
    forwardProp(net, inputOf(p.x, p.y));
    backProp(net, p.label);
    if ((i + 1) % S.batch === 0) updateWeights(net, S.lr, S.regRate);
  });
  lossTrain = getLoss(trainData); lossTest = getLoss(testData);
  hist.train.push(lossTrain); hist.test.push(lossTest);
}
const atLimit = () => S.maxEpochs > 0 && iter >= S.maxEpochs;
function oneStep(n = 1) {
  for (let i = 0; i < n && !atLimit(); i++) trainEpoch();
  refresh(false, true);
}

/* ---------- drawing ---------- */
// scratch canvases reused across frames
const scratch = {};
function paintGrid(cvs, values, n, points, discretize, rect) {
  // values: n x n matrix indexed [col][row]; draws smooth background then optional points
  const key = n; let off = scratch[key];
  if (!off) { off = scratch[key] = document.createElement('canvas'); off.width = off.height = n }
  const octx = off.getContext('2d'), img = octx.createImageData(n, n);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    let v = values[c][r]; if (discretize) v = v >= 0 ? 1 : -1;
    const [R, G, B] = rgbOf(v), o = (r * n + c) * 4;
    img.data[o] = R; img.data[o + 1] = G; img.data[o + 2] = B; img.data[o + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  const ctx = cvs.getContext('2d'), [ox, oy, w] = rect || [0, 0, cvs.width];
  ctx.imageSmoothingEnabled = !discretize;
  ctx.drawImage(off, ox, oy, w, w);
  if (points) {
    for (const [pts, test] of points) for (const p of pts) {
      const x = ox + (p.x + XD) / (2 * XD) * w, y = oy + (XD - p.y) / (2 * XD) * w;
      ctx.beginPath(); ctx.arc(x, y, w / 100 * 1.5, 0, 7);
      ctx.fillStyle = color(p.label); ctx.fill();
      ctx.lineWidth = test ? 1.2 : 0.8; ctx.strokeStyle = test ? cssv('text') : cssv('crust'); ctx.stroke();
    }
  }
}


// the big output picture: heatmap + data points inside a plot with grid, tick labels, axis titles and a legend
const FONT = '"LINE Seed", system-ui, sans-serif';
function paintMain() {
  const cv = $('#pg-main'), ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  const L = 46, T = 44, Rr = 14, B = 42, s = W - L - Rr;
  ctx.clearRect(0, 0, W, H);
  const outId = net[net.length - 1][0].id, id = hoverNode || outId, reg = S.problem === 'regression';
  paintGrid(cv, grid[id], DENS, [[trainData, false], ...(S.showTest ? [[testData, true]] : [])], S.discretize, [L, T, s]);
  ctx.lineWidth = 1; ctx.font = `15px ${FONT}`; ctx.fillStyle = cssv('o1');
  for (let v = -6; v <= 6; v += 2) {
    const p = (v + XD) / (2 * XD) * s;
    ctx.strokeStyle = v === 0 ? '#cdd6f466' : '#cdd6f41a';
    ctx.beginPath(); ctx.moveTo(L + p + .5, T); ctx.lineTo(L + p + .5, T + s); ctx.moveTo(L, T + s - p + .5); ctx.lineTo(L + s, T + s - p + .5); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(v, L + p, T + s + 6);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(v, L - 7, T + s - p);
  }
  ctx.fillStyle = cssv('sub0'); ctx.font = `16px ${FONT}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText('X1', L + s / 2, H - 2);
  ctx.save(); ctx.translate(12, T + s / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'top'; ctx.fillText('X2', 0, -2); ctx.restore();
  // title
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = cssv('text'); ctx.font = `17px ${FONT}`;
  const title = id === outId ? 'Network output' : F[id] ? 'Feature ' + F[id].label : 'Neuron ' + id;
  ctx.fillText(title, L, 20);
  // legend (right, top)
  ctx.font = `15px ${FONT}`; ctx.textAlign = 'right';
  let x = W - Rr;
  const chip = (col, text, ring) => {
    ctx.fillStyle = cssv('sub0'); ctx.fillText(text, x, 20); x -= ctx.measureText(text).width + 12;
    ctx.beginPath(); ctx.arc(x, 20, 6, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = ring ? 2 : 1; ctx.strokeStyle = ring ? cssv('text') : cssv('crust'); ctx.stroke(); x -= 20;
  };
  if (S.showTest) chip(cssv('s1'), 'Test', true);
  if (reg) { chip(cssv('peach'), '−1'); chip(cssv('blue'), '+1') } else { chip(cssv('peach'), 'Class −1'); chip(cssv('blue'), 'Class +1') }
}

// grid[id][c][r]: output of every node (and every input feature) at each grid cell
function computeGrid() {
  const ids = [];
  net.forEach((layer, li) => layer.forEach(n => ids.push(n.id)));
  FEATURES.forEach(([id]) => ids.push(id));
  grid = {}; ids.forEach(id => grid[id] = Array.from({ length: DENS }, () => new Float32Array(DENS)));
  const act = activeIds();
  for (let c = 0; c < DENS; c++) for (let r = 0; r < DENS; r++) {
    const x = -XD + c / (DENS - 1) * 2 * XD, y = XD - r / (DENS - 1) * 2 * XD;
    forwardProp(net, act.map(id => F[id].f(x, y)));
    for (let li = 1; li < net.length; li++) for (const n of net[li]) grid[n.id][c][r] = n.output;
    for (const [id, , f] of FEATURES) grid[id][c][r] = f(x, y);
  }
}
const sub = (m, k) => { const n = DENS / k; return Array.from({ length: n }, (_, c) => Array.from({ length: n }, (_, r) => m[c * k + k / 2][r * k + k / 2])) };

// features can exceed [-1,1] (x², x·y); scale them so the heatmap reads like the original
const featScale = id => ({ xSquared: 1 / 36, ySquared: 1 / 36, xTimesY: 1 / 36, x: 1 / 6, y: 1 / 6, sinX: 1, sinY: 1 }[id]);
const scaled = (m, s) => m.map(col => Array.from(col, v => v * s));

function refresh(first, skipHist) {
  computeGrid();
  paintMain();
  $$('#pg-net canvas[data-node]').forEach(cv => {
    const id = cv.dataset.node, m = F[id] ? scaled(grid[id], featScale(id)) : grid[id];
    paintGrid(cv, sub(m, 10), 10, null, false);
  });
  drawLinks();
  $('#pg-iter').textContent = String(iter).padStart(6, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  $('#pg-lim').textContent = S.maxEpochs ? `of ${S.maxEpochs.toLocaleString('en-US')}` : 'no limit';
  $('#pg-lt').textContent = lossTrain.toFixed(3); $('#pg-le').textContent = lossTest.toFixed(3);
  if (first) { hist.train.push(lossTrain); hist.test.push(lossTest) }
  drawChart();
}

/* network: nodes are canvases in a positioned box, links are an SVG underneath */
const NODE = 36, GAP = 22, BIAS = 6;
let pos = {};
function buildNet() {
  const box = $('#pg-net'); box.innerHTML = ''; pos = {};
  const W = box.clientWidth || 600, nL = net.length;
  const rows = Math.max(FEATURES.length, ...net.map(l => l.length));
  const colX = i => 62 + NODE / 2 + i * ((W - NODE - 62 - 56) / (nL - 1 || 1));
  const rowY = i => 60 + i * (NODE + GAP) + NODE / 2;
  box.style.height = (60 + rows * (NODE + GAP) + 4) + 'px';
  box.insertAdjacentHTML('beforeend', '<svg id="pg-links"></svg>');
  const head = (li, t, sub) => box.insertAdjacentHTML('beforeend', `<div class="lh" style="left:${colX(li) - 50}px"><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</div>`);
  head(0, 'Input layer', 'features');
  // inputs: all 7 shown, inactive ones dimmed and clickable
  FEATURES.forEach(([id, label], i) => {
    const on = S.on[id];
    const el = document.createElement('div');
    el.className = 'pn feat' + (on ? ' on' : '');
    el.style.cssText = `left:${colX(0) - NODE / 2}px;top:${rowY(i) - NODE / 2}px`;
    el.innerHTML = `<canvas data-node="${id}" width="${NODE}" height="${NODE}"></canvas><span>${label}</span>`;
    el.title = (on ? 'Turn off ' : 'Turn on ') + label;
    el.onclick = () => { S.on[id] = !S.on[id]; if (!activeIds().length) S.on[id] = true; reset() };
    el.onmouseenter = () => { if (on) hoverNode = id, refresh1() };
    el.onmouseleave = () => { hoverNode = null; refresh1() };
    box.append(el);
    if (on) pos[id] = { x: colX(0), y: rowY(i), node: net[0].find(n => n.id === id) };
  });
  net.forEach((layer, li) => {
    if (li === 0) return;
    const out = li === nL - 1;
    layer.forEach((n, i) => {
      const el = document.createElement('div');
      el.className = 'pn' + (out ? ' out' : '');
      el.style.cssText = `left:${colX(li) - NODE / 2}px;top:${rowY(i) - NODE / 2}px`;
      el.innerHTML = `<canvas data-node="${n.id}" width="${NODE}" height="${NODE}"></canvas><i class="bias" data-bias="${n.id}" title="Bias"></i>`;
      el.onmouseenter = () => { hoverNode = n.id; refresh1(); tip(`Bias ${n.bias.toFixed(3)}`, el) };
      el.onmouseleave = () => { hoverNode = null; refresh1(); tip() };
      box.append(el);
      pos[n.id] = { x: colX(li), y: rowY(i), node: n };
    });
    if (out) head(li, 'Output layer', S.problem === 'regression' ? 'predicted value' : 'prediction');
    else head(li, 'Hidden layer ' + li, layer.length + (layer.length === 1 ? ' neuron' : ' neurons'));
    if (!out) {
      const ctl = document.createElement('div');
      ctl.className = 'lctl'; ctl.style.cssText = `left:${colX(li) - 32}px;top:34px`;
      ctl.innerHTML = `<button aria-label="Remove neuron" ${layer.length <= 1 ? 'disabled' : ''}>−</button><b>${layer.length}</b><button aria-label="Add neuron" ${layer.length >= 8 ? 'disabled' : ''}>+</button>`;
      const [m, p] = ctl.querySelectorAll('button');
      m.onclick = () => { S.shape[li - 1]--; reset() };
      p.onclick = () => { S.shape[li - 1]++; reset() };
      box.append(ctl);
    }
  });
  $('#pg-layers').textContent = S.shape.length;
  $('#pg-lminus').disabled = S.shape.length <= 0; $('#pg-lplus').disabled = S.shape.length >= 6;
}
// hover only needs the big heatmap
function refresh1() {
  paintMain();
}

function drawLinks() {
  const svg = $('#pg-links'), box = $('#pg-net');
  svg.setAttribute('width', box.clientWidth); svg.setAttribute('height', box.clientHeight);
  let h = '', lbl = '';
  const width = w => Math.min(8, 0.6 + Math.abs(w) * 2.2);
  for (let li = 1; li < net.length; li++) for (const n of net[li]) {
    const d = pos[n.id]; if (!d) continue;
    for (const k of n.inLinks) {
      const s = pos[k.source.id]; if (!s) continue;
      const x1 = s.x + NODE / 2, x2 = d.x - NODE / 2, mx = (x1 + x2) / 2;
      h += `<path class="lk${k.dead ? ' dead' : ''}" data-k="${k.source.id}>${n.id}" d="M${x1},${s.y}C${mx},${s.y} ${mx},${d.y} ${x2},${d.y}" stroke="${color(k.weight)}" stroke-width="${width(k.weight)}"/>`;
      if (S.weights) { // stagger labels along each line so converging lines don't stack their numbers
        const j = n.inLinks.indexOf(k), m = n.inLinks.length, t = m > 1 ? 0.3 + 0.5 * j / (m - 1) : 0.6, u = 1 - t;
        const lx = u*u*u*x1 + 3*u*u*t*mx + 3*u*t*t*mx + t*t*t*x2, ly = u*u*u*s.y + 3*u*u*t*s.y + 3*u*t*t*d.y + t*t*t*d.y;
        lbl += `<text x="${lx}" y="${ly + 3}" text-anchor="middle">${k.weight.toFixed(2)}</text>`;
      }
    }
  }
  svg.innerHTML = h + lbl;
  $$('#pg-links .lk').forEach(p => {
    const [a, b] = p.dataset.k.split('>'), k = pos[b].node.inLinks.find(l => l.source.id === a);
    p.onmouseenter = e => tip(`Weight ${k.weight.toFixed(3)}`, null, e);
    p.onmousemove = e => tip(`Weight ${k.weight.toFixed(3)}`, null, e);
    p.onmouseleave = () => tip();
    p.onclick = e => editWeight(k, e);
  });
  for (const id in pos) {
    const b = $(`[data-bias="${id}"]`); if (b) b.style.background = color(pos[id].node.bias);
  }
}

function tip(text, el, e) {
  const t = $('#pg-tip');
  if (!text) return t.hidden = true;
  const r = $('#pg-net').getBoundingClientRect();
  t.hidden = false; t.textContent = text;
  const x = e ? e.clientX - r.left : el.offsetLeft + NODE / 2, y = e ? e.clientY - r.top : el.offsetTop - 8;
  t.style.left = x + 'px'; t.style.top = y + 'px';
}
function editWeight(k, e) {
  const box = $('#pg-edit'), r = $('#pg-net').getBoundingClientRect();
  box.hidden = false; box.style.left = e.clientX - r.left + 'px'; box.style.top = e.clientY - r.top + 'px';
  const inp = box.querySelector('input'); inp.value = k.weight.toFixed(3); inp.focus(); inp.select();
  inp.onkeydown = ev => {
    if (ev.key === 'Enter') { const v = parseFloat(inp.value); if (!isNaN(v)) { k.weight = v; refresh() } box.hidden = true }
    if (ev.key === 'Escape') box.hidden = true;
  };
  inp.onblur = () => box.hidden = true;
}

function drawChart() {
  const cv = $('#pg-chart'), ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
  const L = 84, R = 78, T = 16, B = 62, pw = w - L - R, ph = h - T - B;
  ctx.clearRect(0, 0, w, h);
  const max = Math.max(0.05, ...hist.train, ...hist.test), n = hist.train.length, last = Math.max(1, n - 1);
  ctx.font = `20px ${FONT}`; ctx.fillStyle = cssv('o1'); ctx.strokeStyle = cssv('s0'); ctx.lineWidth = 2;
  // horizontal grid + loss ticks
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) { const y = T + ph * i / 4; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + pw, y); ctx.stroke(); ctx.fillText((max * (1 - i / 4)).toFixed(2), L - 10, y) }
  // vertical grid + epoch ticks
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let i = 0; i <= 4; i++) { const x = L + pw * i / 4; ctx.beginPath(); ctx.moveTo(x, T); ctx.lineTo(x, T + ph); ctx.stroke(); ctx.fillText(Math.round(last * i / 4), x, T + ph + 8) }
  ctx.fillStyle = cssv('sub0'); ctx.fillText('Epoch', L + pw / 2, h - 28);
  ctx.save(); ctx.translate(10, T + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'top'; ctx.fillText('Loss', 0, -4); ctx.restore();
  for (const [arr, col, name] of [[hist.test, cssv('peach'), 'test'], [hist.train, cssv('blue'), 'train']]) {
    if (arr.length < 1) continue;
    const X = i => L + i / last * pw, Y = v => T + ph - v / max * ph;
    ctx.beginPath(); ctx.lineWidth = 3.2; ctx.lineJoin = 'round'; ctx.strokeStyle = col;
    arr.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)));
    ctx.stroke();
    const v = arr[arr.length - 1], x = X(arr.length - 1), y = Y(v);
    ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = cssv('mantle'); ctx.stroke();
    ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = name === 'test' ? 'bottom' : 'top'; ctx.font = `19px ${FONT}`;
    ctx.fillText(v.toFixed(3), Math.min(x + 10, w - R + 6), y + (name === 'test' ? -2 : 2));
  }
}

/* ---------- loop ---------- */
function loop() { oneStep(S.speed); if (atLimit()) return stop(); raf = requestAnimationFrame(loop) }
function play() { if (raf || atLimit()) return; raf = requestAnimationFrame(loop); setPlay(true) }
function stop() { cancelAnimationFrame(raf); raf = 0; setPlay(false) }
function setPlay(on) { const b = $('#pg-play'); if (!b) return; b.classList.toggle('on', on); b.querySelector('use').setAttribute('href', on ? '#i-pause' : '#i-play'); b.title = on ? 'Pause' : 'Play' }

/* ---------- controls ---------- */
const fill = (sel, opts) => { $(sel).innerHTML = opts.map(([v, t]) => `<option value="${v}">${t}</option>`).join('') };
const NAMES = { circle: 'Circle', xor: 'XOR', gauss: 'Two clusters', spiral: 'Spiral', 'reg-plane': 'Plane', 'reg-gauss': 'Six peaks' };
function thumbs() {
  const reg = S.problem === 'regression', names = reg ? ['reg-plane', 'reg-gauss'] : ['circle', 'xor', 'gauss', 'spiral'];
  $('#pg-sets').innerHTML = names.map(n => `<button class="ds${(reg ? S.regDataset : S.dataset) === n ? ' on' : ''}" data-ds="${n}" title="${NAMES[n]}"><canvas width="60" height="60"></canvas><span>${NAMES[n]}</span></button>`).join('');
  $$('#pg-sets .ds').forEach(b => {
    const cv = b.querySelector('canvas'), ctx = cv.getContext('2d');
    for (const p of DATA[b.dataset.ds](200, 0)) { ctx.fillStyle = color(p.label); ctx.fillRect(60 * (p.x + XD) / 12, 60 * (XD - p.y) / 12, 3, 3) }
    b.onclick = () => { S[reg ? 'regDataset' : 'dataset'] = b.dataset.ds; thumbs(); generate(); reset() };
  });
}
const bind = (sel, key, parse = v => v, after) => {
  const el = $(sel); el.value = el.type === 'checkbox' ? undefined : S[key];
  el.oninput = el.onchange = () => {
    S[key] = el.type === 'checkbox' ? el.checked : parse(el.value);
    const out = $(sel + '-v'); if (out) out.textContent = S[key];
    (after || reset)();
  };
  const out = $(sel + '-v'); if (out) out.textContent = S[key];
};

function dropdown(sel) {
  const wrap = document.createElement('div'); wrap.className = 'dd';
  sel.before(wrap); wrap.append(sel); sel.hidden = true;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ddb'; btn.setAttribute('aria-haspopup', 'listbox');
  const list = document.createElement('ul'); list.className = 'ddl'; list.setAttribute('role', 'listbox'); list.hidden = true;
  wrap.append(btn, list);
  const sync = () => {
    btn.innerHTML = `<span>${sel.selectedOptions[0].text}</span><svg class="i"><use href="#i-caret-down"/></svg>`;
    list.innerHTML = [...sel.options].map(o => `<li role="option" data-v="${o.value}"${o.value === sel.value ? ' class="on" aria-selected="true"' : ''}>${o.text}</li>`).join('');
  };
  const close = () => { list.hidden = true; btn.setAttribute('aria-expanded', 'false') };
  btn.onclick = e => { e.stopPropagation(); const was = list.hidden; $$('.ddl').forEach(l => l.hidden = true); list.hidden = !was; btn.setAttribute('aria-expanded', String(was)); list.querySelector('.on')?.scrollIntoView({ block: 'nearest' }) };
  list.onclick = e => { const li = e.target.closest('li'); if (!li) return; sel.value = li.dataset.v; sel.dispatchEvent(new Event('change')); sync(); close(); btn.focus() };
  wrap.onkeydown = e => {
    if (e.key === 'Escape') return close();
    const i = sel.selectedIndex + (e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0);
    if (i !== sel.selectedIndex && sel.options[i]) { e.preventDefault(); sel.selectedIndex = i; sel.dispatchEvent(new Event('change')); sync() }
  };
  sync();
}
addEventListener('click', () => $$('.ddl').forEach(l => l.hidden = true));

function init() {
  fill('#pg-lr', [0.00001, 0.0001, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10].map(v => [v, v]));
  fill('#pg-act', [['tanh', 'Tanh'], ['relu', 'ReLU'], ['sigmoid', 'Sigmoid'], ['linear', 'Linear']]);
  fill('#pg-reg', [['none', 'None'], ['L1', 'L1'], ['L2', 'L2']]);
  fill('#pg-rr', [0, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10].map(v => [v, v]));
  fill('#pg-prob', [['classification', 'Classification'], ['regression', 'Regression']]);
  bind('#pg-lr', 'lr', parseFloat, () => {});
  bind('#pg-act', 'activation'); bind('#pg-reg', 'regularization');
  bind('#pg-rr', 'regRate', parseFloat, () => {});
  bind('#pg-prob', 'problem', v => v, () => { thumbs(); generate(); reset() });
  bind('#pg-train', 'train', Number, () => { generate(); reset() });
  bind('#pg-noise', 'noise', Number, () => { generate(); reset() });
  bind('#pg-batch', 'batch', Number, () => {});
  fill('#pg-speed', [[1, '1×'], [2, '2×'], [5, '5×'], [10, '10×'], [25, '25×'], [50, '50×']]);
  $('#pg-speed').onchange = e => { S.speed = +e.target.value };
  $('#pg-max').oninput = e => { S.maxEpochs = Math.max(0, Math.floor(+e.target.value) || 0); $('#pg-lim').textContent = S.maxEpochs ? `of ${S.maxEpochs.toLocaleString('en-US')}` : 'no limit' };
  $('#pg-wv').onchange = e => { S.weights = e.target.checked; drawLinks() };
  $('#pg-test').onchange = e => { S.showTest = e.target.checked; refresh1() };
  $('#pg-disc').onchange = e => { S.discretize = e.target.checked; refresh(); };
  $('#pg-regen').onclick = () => { generate(); reset() };
  $('#pg-play').onclick = () => raf ? stop() : play();
  $('#pg-step').onclick = () => { stop(); oneStep() };
  $('#pg-reset').onclick = reset;
  $('#pg-lminus').onclick = () => { S.shape.pop(); reset() };
  $('#pg-lplus').onclick = () => { S.shape.push(2); reset() };
  addEventListener('resize', () => { if (net) { buildNet(); refresh(false, true) } });
  $$('.pgf select').forEach(dropdown);
  thumbs(); generate(); reset();
}
init();
document.fonts && document.fonts.ready.then(() => net && drawChart());
})();
