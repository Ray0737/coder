// More lesson diagrams (RNN to LLM/RL). Loaded before chapter.js, merged into its `widgets` registry.
// Same plain toolbar everywhere: line 1 = choices + Play/Step/Reset buttons, line 2 = sliders and readouts.
// Helpers $, $$, seeded, trackTimer come from chapter.js and are only used at call time.
(() => {
  const bt = (id, label, cls = '') => `<button class="bt ${cls}" id="${id}" type="button">${label}</button>`;
  const btns = (p, step = true) => bt(p + '-play', 'Play', 'act') + (step ? bt(p + '-step', 'Step') : '') + bt(p + '-reset', 'Reset');
  const chips = (id, items, sel = 0) => `<span class="opts" id="${id}">${items.map((t, i) => `<button type="button" class="bt${i === sel ? ' on' : ''}" data-i="${i}">${t}</button>`).join('')}</span>`;
  const pickIn = (q, id, fn) => { q(id).onclick = e => { const b = e.target.closest('button'); if (!b) return; q(id).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); fn(+b.dataset.i, b); }; };
  const lum = v => `color-mix(in srgb, var(--text) ${Math.round(Math.max(0, Math.min(1, v)) * 100)}%, var(--crust))`;
  const sgn = (v, m) => v === 0 ? 'var(--base)' : `color-mix(in srgb, var(${v > 0 ? '--red' : '--blue'}) ${Math.min(100, Math.round(Math.abs(v) / m * 100))}%, var(--base))`;
  const pg = (vals, n, px, bg) => `<div class="pg" style="grid-template-columns:repeat(${n},${px}px);--s:${px}px">${vals.map(v => `<i style="background:${bg(v)}"></i>`).join('')}</div>`;
  // Play/Step/Reset wiring shared by every stepping widget: st.pos runs 0..max
  const wire = (q, p, st, max, ms, draw) => {
    let timer = null;
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } q('#' + p + '-play').textContent = 'Play'; };
    if (q('#' + p + '-step')) q('#' + p + '-step').onclick = () => { stop(); if (st.pos < max) st.pos++; draw(); };
    q('#' + p + '-reset').onclick = () => { stop(); st.pos = 0; draw(); };
    q('#' + p + '-play').onclick = () => {
      if (timer) return stop();
      if (st.pos >= max) st.pos = 0;
      q('#' + p + '-play').textContent = 'Pause';
      timer = trackTimer(setInterval(() => { if (st.pos >= max) return stop(); st.pos++; draw(); }, ms)); draw();
    };
    return stop;
  };
  // a small line plot: series [{v:[...], c:'peach', dash:1}], x = index, drawn up to `upto`
  const lines = (series, ymax, upto, title, xlabel, w = 260, h = 110) => {
    const n = Math.max(...series.map(s => s.v.length)) - 1, xs = i => 30 + i / n * (w - 44), ys = v => h - 20 - Math.min(Math.max(v, 0), ymax) / ymax * (h - 34);
    return `<svg viewBox="0 0 ${w} ${h}"><line x1="30" y1="${h - 20}" x2="${w - 12}" y2="${h - 20}" stroke="var(--s1)"/><line x1="30" y1="12" x2="30" y2="${h - 20}" stroke="var(--s1)"/>
      ${series.map(s => `<polyline points="${s.v.slice(0, upto + 1).map((v, i) => xs(i) + ',' + ys(v)).join(' ')}" fill="none" stroke="var(--${s.c})" stroke-width="1.5"${s.dash ? ' stroke-dasharray="4 3"' : ''}/>`).join('')}
      <line x1="${xs(upto)}" y1="12" x2="${xs(upto)}" y2="${h - 20}" stroke="var(--mauve)" stroke-dasharray="3 3"/>
      <text x="32" y="9" font-size="9" fill="var(--o1)">${title}</text><text x="25" y="${h - 17}" font-size="8" fill="var(--o0)" text-anchor="end">0</text><text x="25" y="20" font-size="8" fill="var(--o0)" text-anchor="end">${ymax}</text>
      <text x="${w - 12}" y="${h - 6}" font-size="8" fill="var(--o0)" text-anchor="end">${xlabel}</text></svg>`;
  };
  const fetched = {};
  const getJSON = url => fetched[url] || (fetched[url] = fetch(url).then(r => r.json()));
  const failMsg = (el, title) => () => { el.innerHTML = `<p class="wgt">${title}</p><p class="wgcap">Could not load the data. Open the site over http, not as a plain file.</p>`; };

  window.moreWidgets = {
    // ---------- RNN / LSTM ----------
    // gradient left after t steps back: a plain RNN multiplies by w each step, an LSTM cell state by the forget gate f, a GRU keeps (1 - z) of its old state
    // ponytail: only the main path is drawn (one factor per step); the real gradient has extra terms
    gradcompare(el) {
      const q = s => el.querySelector(s), st = { pos: 20 };
      el.innerHTML = `<p class="wgt">Try it: how much signal survives going back in time</p>
        <div class="tb"><span>Gradient flowing back through 20 timesteps</span><span class="sp"></span>${btns('gc', false)}</div>
        <div class="tb ro"><label>RNN weight w <input id="gc-w" type="range" min="0.5" max="1.2" step="0.01" value="0.8"></label><b id="gc-wv"></b>
          <label>LSTM forget gate f <input id="gc-f" type="range" min="0.8" max="1" step="0.01" value="0.95"></label><b id="gc-fv"></b>
          <label>GRU update gate z <input id="gc-z" type="range" min="0" max="0.2" step="0.01" value="0.1"></label><b id="gc-zv"></b></div>
        <div class="plots" id="gc-p"></div><div class="afrow" id="gc-say"></div>
        <p class="wgcap sm">Each step back multiplies the signal by w (RNN), f (LSTM) or 1 − z (GRU, the share of old state it keeps). Below 1 it shrinks exponentially, above 1 it explodes.</p>`;
      const draw = () => {
        const w = +q('#gc-w').value, f = +q('#gc-f').value, z = +q('#gc-z').value, k = 1 - z, at = st.pos;
        const pw = base => Array.from({ length: 21 }, (_, t) => base ** t), rnn = pw(w), lstm = pw(f), gru = pw(k);
        q('#gc-wv').textContent = w.toFixed(2); q('#gc-fv').textContent = f.toFixed(2); q('#gc-zv').textContent = z.toFixed(2);
        q('#gc-p').innerHTML = lines([{ v: rnn, c: 'red' }, { v: lstm, c: 'blue' }, { v: gru, c: 'green' }], 2, at, 'Gradient size (red = RNN, blue = LSTM, green = GRU)', 'steps back 20', 420, 150);
        const pc = v => (v * 100).toFixed(v < 0.1 ? 1 : 0) + '%';
        q('#gc-say').innerHTML = `<div><span>Plain RNN</span><small>after ${at} steps back</small><b style="color:var(--red)">${pc(rnn[at])}</b></div><div><span>LSTM</span><small>after ${at} steps back</small><b style="color:var(--blue)">${pc(lstm[at])}</b></div><div><span>GRU</span><small>after ${at} steps back</small><b style="color:var(--green)">${pc(gru[at])}</b></div>`;
      };
      ['#gc-w', '#gc-f', '#gc-z'].forEach(id => q(id).oninput = draw);
      wire(q, 'gc', st, 20, 180, draw); draw();
    },

    // one LSTM cell stepping through "the cat sat on the mat": c_t = f*c_(t-1) + i*g, h = o*tanh(c); gate numbers are illustrative, the arithmetic is real
    lstmaction(el) {
      const words = ['the', 'cat', 'sat', 'on', 'the', 'mat'], F = [.8, .6, .9, .9, .5, .85], I = [.3, .95, .7, .3, .3, .9], O = [.5, .85, .8, .4, .3, .95];
      const notes = ['An article, not very informative. The input gate is low (0.30), so little is written; there is nothing to forget yet.',
        'A new subject. The input gate is wide open (0.95): write "cat" into memory. The forget gate drops to 0.60 to make room.',
        'The verb. The forget gate is high (0.90): keep the subject while adding the action.',
        'A preposition, little new information. Keep what is there (0.90), write little (0.30), say little (0.40).',
        'Another article. The forget gate dips to 0.50: some old detail is released while little new is written.',
        'The object completes the phrase. Write it (0.90) and open the output gate (0.95) so the rest of the network sees the summary.'];
      const rnd = seeded(3), G = words.map((_, t) => [[.2, .9, .7, .1, .2, .8][t], ...Array.from({ length: 4 }, () => rnd() * 2 - 1)]);
      const C = [], H = []; let c = Array(5).fill(0);
      words.forEach((_, t) => { c = c.map((v, d) => F[t] * v + I[t] * G[t][d]); C.push(c); H.push(c.map(v => O[t] * Math.tanh(v))); });
      const q = s => el.querySelector(s), st = { pos: 0 };
      el.innerHTML = `<p class="wgt">Try it: one LSTM cell reading a sentence</p>
        <div class="tb"><span>Word</span>${chips('ls-w', words)}<span class="sp"></span>${btns('ls')}</div>
        <div class="tb ro" id="ls-ro"></div>
        <div class="lsrow"><svg viewBox="0 0 520 190" id="ls-svg" class="lssvg"></svg><div id="ls-ch"></div></div>
        <p class="wgo" id="ls-n"></p>
        <p class="wgcap">The gate values are hand-picked to tell the story and the cell state and hidden state are computed from them with the real LSTM equations. A trained LSTM learns its own gate values.</p>`;
      const draw = () => {
        const t = st.pos, cp = t ? C[t - 1][0] : 0, ct = C[t][0], ht = H[t][0];
        const gate = (x, nm, v, col) => `<rect x="${x}" y="120" width="86" height="46" rx="7" fill="color-mix(in srgb,var(--${col}) 22%,var(--base))" stroke="var(--${col})"/><text x="${x + 43}" y="138" font-size="10" fill="var(--text)" text-anchor="middle">${nm}</text><text x="${x + 43}" y="156" font-size="13" fill="var(--text)" text-anchor="middle" font-weight="700">${v.toFixed(2)}</text>`;
        q('#ls-svg').innerHTML = `<line x1="16" y1="34" x2="504" y2="34" stroke="var(--blue)" stroke-width="3"/><text x="16" y="22" font-size="9" fill="var(--blue)">cell state c (long-term memory)</text>
          <text x="16" y="52" font-size="10" fill="var(--text)">${cp.toFixed(2)}</text><text x="470" y="52" font-size="10" fill="var(--text)">${ct.toFixed(2)}</text>
          <circle cx="110" cy="34" r="10" fill="var(--base)" stroke="var(--yellow)"/><text x="110" y="38" font-size="12" text-anchor="middle" fill="var(--yellow)">×</text>
          <circle cx="250" cy="34" r="10" fill="var(--base)" stroke="var(--yellow)"/><text x="250" y="38" font-size="12" text-anchor="middle" fill="var(--yellow)">+</text>
          <line x1="153" y1="120" x2="153" y2="90" stroke="var(--red)"/><line x1="153" y1="90" x2="110" y2="90" stroke="var(--red)"/><line x1="110" y1="90" x2="110" y2="44" stroke="var(--red)"/>
          <line x1="293" y1="120" x2="293" y2="74" stroke="var(--red)"/><line x1="293" y1="74" x2="250" y2="74" stroke="var(--red)"/><line x1="250" y1="74" x2="250" y2="44" stroke="var(--red)"/>
          <text x="256" y="68" font-size="9" fill="var(--green)">new info (i × g)</text>
          <line x1="400" y1="34" x2="400" y2="72" stroke="var(--blue)"/><rect x="370" y="72" width="60" height="22" rx="6" fill="color-mix(in srgb,var(--green) 25%,var(--base))" stroke="var(--green)"/><text x="400" y="87" font-size="10" fill="var(--text)" text-anchor="middle">tanh</text>
          <circle cx="400" cy="112" r="10" fill="var(--base)" stroke="var(--yellow)"/><text x="400" y="116" font-size="12" text-anchor="middle" fill="var(--yellow)">×</text><line x1="400" y1="94" x2="400" y2="102" stroke="var(--blue)"/>
          <line x1="456" y1="143" x2="456" y2="112" stroke="var(--red)"/><line x1="456" y1="112" x2="410" y2="112" stroke="var(--red)"/>
          <line x1="410" y1="112" x2="410" y2="112"/><text x="504" y="100" font-size="11" fill="var(--text)" text-anchor="end">h = ${ht.toFixed(2)}</text>
          ${gate(110, 'forget gate', F[t], 'red')}${gate(250, 'input gate', I[t], 'red')}${gate(413, 'output gate', O[t], 'red')}
          <text x="260" y="184" font-size="11" fill="var(--text)" text-anchor="middle">input x = "${words[t]}"</text>`;
        q('#ls-ro').innerHTML = `<span>Step <b>${t + 1} / 6</b> · "${words[t]}" · c ${cp.toFixed(2)} → <b>${ct.toFixed(2)}</b> = ${F[t].toFixed(2)} × ${cp.toFixed(2)} + ${I[t].toFixed(2)} × ${G[t][0].toFixed(2)}</span>`;
        q('#ls-n').innerHTML = `<b>Step ${t + 1}: "${words[t]}".</b> ${notes[t]}`;
        const cols = ['red', 'blue', 'green', 'yellow', 'mauve'];
        q('#ls-ch').innerHTML = lines(cols.map((c, d) => ({ v: H.map(h => Math.abs(h[d])), c })), 1, t, '|hidden state| per dimension', 'word 6', 230, 190);
        q('#ls-w').querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === t));
      };
      pickIn(q, '#ls-w', i => { st.pos = i; draw(); });
      wire(q, 'ls', st, 5, 1200, draw); draw();
    },

    // ---------- Transformer ----------
    tfarch(el) {
      const q = s => el.querySelector(s), kinds = { all: 'Every block here is repeated N times. Pick a kind to light it up.', emb: 'Embedding + positional encoding: words become vectors, then a wave pattern is added so the model knows each word\'s position.', att: 'Attention: every word looks at the others. The decoder has two kinds: masked self-attention (cannot peek ahead) and cross-attention (reads the encoder).', add: 'Add & Norm: a skip connection (like ResNet) plus layer normalisation, after every sub-block, so deep stacks stay trainable.', ffn: 'Feed-forward network: a small 2-layer MLP applied to each word on its own, after attention has mixed the words.' };
      const enc = [['emb', 'Input embedding + positional encoding'], ['att', 'Multi-head self-attention'], ['add', 'Add & Norm'], ['ffn', 'Feed-forward network'], ['add', 'Add & Norm']];
      const dec = [['emb', 'Output embedding + positional encoding'], ['att', 'Masked self-attention'], ['add', 'Add & Norm'], ['att', 'Cross-attention (reads encoder)'], ['add', 'Add & Norm'], ['ffn', 'Feed-forward network'], ['add', 'Add & Norm']];
      el.innerHTML = `<p class="wgt">Try it: the Transformer, block by block</p>
        <div class="tb"><span>Highlight</span>${chips('ta-c', ['All', 'Embedding', 'Attention', 'Add & Norm', 'Feed-forward'])}</div>
        <div class="arch"><div class="stack"><b class="ah">Encoder</b>${enc.map(([k, t]) => `<div class="ab" data-k="${k}">${t}</div>`).join('')}<small>× N layers</small></div><span class="arr">→</span>
          <div class="stack"><b class="ah">Decoder</b>${dec.map(([k, t]) => `<div class="ab" data-k="${k}">${t}</div>`).join('')}<small>× N layers → Linear + Softmax → output</small></div></div>
        <p class="wgo" id="ta-n"></p>`;
      const keys = ['all', 'emb', 'att', 'add', 'ffn'];
      const draw = i => { const k = keys[i]; el.querySelectorAll('.ab').forEach(b => b.classList.toggle('on', k === 'all' || b.dataset.k === k)); q('#ta-n').textContent = kinds[k]; };
      pickIn(q, '#ta-c', draw); draw(0);
    },

    // the textbook worked example, with real arithmetic: Q, K, V for "the cat sat", then scores, scaling, softmax, output
    qkvmath(el) {
      const T = ['the', 'cat', 'sat'], Q = [[1, 0, 1, 0], [0, 2, 0, 2], [1, 1, 0, 1]], K = [[1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 1, 0]], V = [[0, 1, 0, 0], [1, 0, 1, 0], [0, 0, 0, 1]];
      const S = Q.map(q => K.map(k => q.reduce((a, v, i) => a + v * k[i], 0))), Sc = S.map(r => r.map(v => v / 2));
      const P = Sc.map(r => { const m = r.map(Math.exp), s = m.reduce((a, b) => a + b); return m.map(v => v / s); });
      const Out = P.map(r => [0, 1, 2, 3].map(d => r.reduce((a, p, j) => a + p * V[j][d], 0)));
      const names = ['1  Q, K, V', '2  Scores Q·Kᵀ', '3  Scale ÷ √2', '4  Softmax', '5  Output'];
      const q = s => el.querySelector(s), st = { pos: 0 };
      el.innerHTML = `<p class="wgt">Try it: attention, with real numbers</p>
        <div class="tb">${chips('qk-c', ['Q K V', 'Scores', 'Scale', 'Softmax', 'Output'])}<span class="sp"></span>${btns('qk')}</div>
        <div id="qk-b"></div>`;
      const mat = (m, rows, cols, fmt, bg) => `<div class="qkm"><div class="qkh"><i></i>${cols.map(c => `<i>${c}</i>`).join('')}</div>${m.map((r, i) => `<div class="qkr"><i>${rows[i]}</i>${r.map((v, j) => `<div class="cvcell" style="background:${bg(v, i, j)}">${fmt(v)}</div>`).join('')}</div>`).join('')}</div>`;
      const d4 = ['d0', 'd1', 'd2', 'd3'], f0 = v => v, f1 = v => v.toFixed(1), f2 = v => v.toFixed(2), bgS = v => sgn(v, 4), bgP = v => lum(v);
      const sec = (n, ttl, txt, body) => `<div class="qks${n === st.pos + 1 && st.pos > 0 ? ' new' : ''}"><p class="wgt2"><span class="num">${n}</span>${ttl}</p><p class="wgcap">${txt}</p>${body}</div>`;
      const draw = () => {
        const t = st.pos; let h = '';
        h += sec(1, 'Three matrices', 'Each word has a Query ("what am I looking for"), a Key ("what do I offer") and a Value ("what I hand over"). They are learned in training.',
          `<div class="qkmats"><div><span>Q (queries)</span>${mat(Q, T, d4, f0, bgS)}</div><div><span>K (keys)</span>${mat(K, T, d4, f0, bgS)}</div><div><span>V (values)</span>${mat(V, T, d4, f0, bgS)}</div></div>`);
        let mid = '';
        if (t >= 1) mid += sec(2, 'Scores = Q · Kᵀ', 'Big number = these two words match.', mat(S, T, T, f0, v => lum(v / 4 * 0.7)));
        if (t >= 2) mid += sec(3, 'Scale by √d', 'Divide by √4 = 2 to keep numbers small.', mat(Sc, T, T, f1, v => lum(v / 2 * 0.7)));
        if (t >= 3) mid += sec(4, 'Softmax', 'Each row becomes percentages adding to 1.', mat(P, T, T, f2, v => lum(v * 0.7)));
        if (t >= 4) mid += sec(5, 'Output = A × V', 'Blend the Values with those percentages.', mat(Out, T, d4, f2, v => lum(v * 0.7)));
        if (mid) h += `<div class="qkrow">${mid}</div>`;
        q('#qk-b').innerHTML = h;
        q('#qk-c').querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === t));
      };
      pickIn(q, '#qk-c', i => { st.pos = i; draw(); });
      wire(q, 'qk', st, 4, 1500, draw); draw();
    },

    // a grid of attention heads: illustrative causal patterns of the kinds real heads learn (first-token, previous-token, self, local, uniform)
    // ponytail: patterns are generated by rule, not read from a trained model; swap in recorded weights if a real model is ever exported
    headsgrid(el) {
      const sents = [['The', 'cat', 'sat', 'on', 'the'], ['I', 'love', 'learning', 'about', 'AI']];
      const kinds = [['local', 'a local window: mostly the last couple of words'], ['self', 'itself: every word mostly looks at itself'], ['prev', 'the previous word, like a "what came just before" detector'], ['first', 'the first word, used as a resting place when nothing else matters'],
        ['uniform', 'everything so far, evenly: a running average of the sentence'], ['mix', 'a mix: itself and the first word']];
      const wt = (k, i, j) => k === 'local' ? Math.exp(-(i - j) * 0.9) : k === 'self' ? (i === j ? 1 : 0.04) : k === 'prev' ? (j === Math.max(0, i - 1) ? 1 : 0.04) : k === 'first' ? (j === 0 ? 1 : 0.04) : k === 'uniform' ? 1 : (i === j ? 0.7 : j === 0 ? 0.5 : 0.05);
      const mats = Array.from({ length: 12 }, (_, h) => { const k = kinds[(h * 5 + 1) % 6][0], rnd = seeded(h + 7); return { k, m: [0, 1, 2, 3, 4].map(i => { const r = [0, 1, 2, 3, 4].map(j => j <= i ? wt(k, i, j) * (0.85 + rnd() * 0.3) : 0), s = r.reduce((a, b) => a + b); return r.map(v => v / s); }) }; });
      const q = s => el.querySelector(s); let si = 0, sel = 0;
      el.innerHTML = `<p class="wgt">Try it: twelve attention heads</p>
        <div class="tb"><span>Sentence</span>${chips('hg-s', sents.map(s => s.join(' ')))}<span class="sp"></span><span>Click a head to open it</span></div>
        <div class="hgrid" id="hg-g"></div><div id="hg-d"></div><p class="wgo" id="hg-n"></p>
        <p class="wgcap">Rows are the word asking, columns the word it looks at. Words cannot look ahead, so the top-right is empty. These twelve are illustrative patterns of the kinds real heads settle into, not weights exported from a trained model.</p>`;
      const draw = () => {
        const T = sents[si];
        q('#hg-g').innerHTML = mats.map((o, h) => `<div class="hh${h === sel ? ' on' : ''}" data-h="${h}">${pg(o.m.flat(), 5, 14, v => `color-mix(in srgb, var(--peach) ${Math.round(v * 100)}%, var(--s0))`)}<small>Head ${h + 1}</small></div>`).join('');
        const m = mats[sel].m, info = kinds.find(k => k[0] === mats[sel].k);
        q('#hg-d').innerHTML = `<div class="qkm"><div class="qkh"><i></i>${T.map(w => `<i>${w}</i>`).join('')}</div>${m.map((r, i) => `<div class="qkr"><i>${T[i]}</i>${r.map(v => `<div class="cvcell" style="background:color-mix(in srgb,var(--peach) ${Math.round(v * 100)}%,var(--s0));font-size:10px">${v.toFixed(2)}</div>`).join('')}</div>`).join('')}</div>`;
        q('#hg-n').innerHTML = `<b>Head ${sel + 1}</b> mostly looks at ${info[1]}.`;
      };
      pickIn(q, '#hg-s', i => { si = i; draw(); });
      q('#hg-g').onclick = e => { const b = e.target.closest('.hh'); if (!b) return; sel = +b.dataset.h; draw(); };
      draw();
    },

    // ---------- Classical ML ----------
    // four classifiers trained live in the browser on three small 2D datasets; the boundary is what each one predicts at every point of the plane
    classifierboundaries(el) {
      const q = s => el.querySelector(s), gauss = r => { let s = 0; for (let i = 0; i < 6; i++) s += r(); return (s - 3) * 1.41; };
      const sets = {
        'Two clusters': () => { const r = seeded(5), p = []; for (let i = 0; i < 60; i++) { p.push([-1.5 + gauss(r) * .6, -1 + gauss(r) * .6, 0]); p.push([1.5 + gauss(r) * .6, 1.2 + gauss(r) * .6, 1]); } return p; },
        Spiral: () => { const r = seeded(6), p = []; for (let i = 0; i < 60; i++) { const t = i / 60 * 3 + .4, a = t * 2; for (const c of [0, 1]) p.push([t * .85 * Math.cos(a + c * Math.PI) + gauss(r) * .07, t * .85 * Math.sin(a + c * Math.PI) + gauss(r) * .07, c]); } return p; },
        XOR: () => { const r = seeded(7), p = []; for (let i = 0; i < 30; i++) for (const [x, y, c] of [[-1.3, -1.3, 0], [1.3, 1.3, 0], [-1.3, 1.3, 1], [1.3, -1.3, 1]]) p.push([x + gauss(r) * .5, y + gauss(r) * .5, c]); return p; },
      };
      const solve = (A, b) => { const n = b.length; for (let i = 0; i < n; i++) { let m = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r; [A[i], A[m]] = [A[m], A[i]]; [b[i], b[m]] = [b[m], b[i]]; for (let r = i + 1; r < n; r++) { const f = A[r][i] / A[i][i]; for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]; b[r] -= f * b[i]; } } const x = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c]; x[i] = s / A[i][i]; } return x; };
      const trainers = {
        'Logistic regression': P => { let w0 = 0, w1 = 0, b = 0; for (let it = 0; it < 400; it++) { let g0 = 0, g1 = 0, gb = 0; for (const [x, y, c] of P) { const e = 1 / (1 + Math.exp(-(w0 * x + w1 * y + b))) - c; g0 += e * x; g1 += e * y; gb += e; } w0 -= .3 * g0 / P.length; w1 -= .3 * g1 / P.length; b -= .3 * gb / P.length; } return (x, y) => 1 / (1 + Math.exp(-(w0 * x + w1 * y + b))); },
        SVM: P => { const k = (a, b2) => Math.exp(-2 * ((a[0] - b2[0]) ** 2 + (a[1] - b2[1]) ** 2)), K = P.map(a => P.map((b2, j) => k(a, b2))); K.forEach((r, i) => r[i] += .1); const al = solve(K, P.map(p => p[2] ? 1 : -1)); return (x, y) => .5 + .5 * Math.max(-1, Math.min(1, P.reduce((s, p, i) => s + al[i] * k([x, y], p), 0))); },
        'Decision tree': P => { const gini = a => { const n = a.length, p = a.filter(v => v[2]).length / n; return 2 * p * (1 - p); }; const build = (S, d) => { const p = S.filter(v => v[2]).length / S.length; if (d >= 6 || S.length < 4 || p === 0 || p === 1) return { p }; let best = null; for (const ax of [0, 1]) { const vs = [...new Set(S.map(v => v[ax]))].sort((a, b) => a - b); for (let i = 1; i < vs.length; i++) { const t = (vs[i - 1] + vs[i]) / 2, L = S.filter(v => v[ax] < t), R = S.filter(v => v[ax] >= t), g = (L.length * gini(L) + R.length * gini(R)) / S.length; if (!best || g < best.g) best = { ax, t, g, L, R }; } } return best ? { ax: best.ax, t: best.t, l: build(best.L, d + 1), r: build(best.R, d + 1) } : { p }; }; const tree = build(P, 0); return (x, y) => { let n = tree; while (n.l) n = (n.ax ? y : x) < n.t ? n.l : n.r; return n.p; }; },
        KNN: P => (x, y) => P.map(p => [(p[0] - x) ** 2 + (p[1] - y) ** 2, p[2]]).sort((a, b) => a[0] - b[0]).slice(0, 5).reduce((s, v) => s + v[1], 0) / 5,
      };
      const info = {
        'Logistic regression': ['Draws one straight line to separate the classes and uses the sigmoid to turn the distance from it into a probability.', 'P(y=1) = σ(w·x + b)', 'This is a single neuron. Stack many of them and you get an MLP.'],
        SVM: ['Looks for the boundary with the widest margin between the classes. With a kernel it can bend into curves.', 'f(x) = Σ αᵢ · k(x, xᵢ)   (RBF kernel)', 'Shown here in its least-squares form with an RBF kernel. A classic SVM keeps only the support vectors.'],
        'Decision tree': ['Asks yes/no questions about one feature at a time, so its boundary is made of horizontal and vertical edges.', 'if x₁ < t then … else …', 'Left alone it keeps splitting until it memorises the data (overfitting), so depth is capped at 6 here.'],
        KNN: ['Looks at the 5 closest training points and goes with the majority.', 'ŷ = majority vote of the 5 nearest points', 'There is no training: the data itself is the model, which makes it slow on big datasets.'],
      };
      const names = Object.keys(trainers), dsn = Object.keys(sets); let ci = 0, di = 0;
      el.innerHTML = `<p class="wgt">Try it: how different classifiers draw the boundary</p>
        <div class="tb"><span>Model</span>${chips('cb-c', ['Logistic', 'SVM', 'Tree', 'KNN'])}<span class="sp"></span><span>Data</span>${chips('cb-d', ['Clusters', 'Spiral', 'XOR'])}</div>
        <div class="tb ro"><span id="cb-ro"></span></div>
        <div class="cbrow"><canvas id="cb-cv" width="340" height="330"></canvas><div class="cbinfo"><b id="cb-t"></b><p id="cb-d1"></p><code id="cb-f"></code><p class="cbnote" id="cb-n"></p></div></div>
        <p class="wgo">No single classifier wins everywhere. A straight line is perfect for two clusters and hopeless for XOR; a tree handles XOR but staircases around curves. Try every pairing.</p>`;
      const draw = () => {
        const P = sets[dsn[di]](), f = trainers[names[ci]](P), cv = q('#cb-cv'), g = cv.getContext('2d'), G = 58, M = 3.5, L = 34, T = 8, S = 290, cell = S / G;
        const px = x => L + (x + M) / (2 * M) * S, py = y => T + (M - y) / (2 * M) * S;
        g.clearRect(0, 0, 340, 330);
        for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) { const p = f(-M + (i + .5) / G * 2 * M, M - (j + .5) / G * 2 * M), conf = Math.abs(p - .5) * 2; g.fillStyle = p >= .5 ? `rgba(203,166,247,${.07 + .17 * conf})` : `rgba(137,180,250,${.07 + .17 * conf})`; g.fillRect(L + i * cell, T + j * cell, cell + .6, cell + .6); }
        // axes with ticks, like a plot in a textbook
        g.strokeStyle = 'rgba(166,173,200,.55)'; g.fillStyle = 'rgba(166,173,200,.8)'; g.lineWidth = 1; g.font = '10px sans-serif';
        g.beginPath(); g.moveTo(L, T); g.lineTo(L, T + S); g.lineTo(L + S, T + S); g.stroke();
        g.textAlign = 'center'; for (let v = -3; v <= 3; v++) { g.beginPath(); g.moveTo(px(v), T + S); g.lineTo(px(v), T + S + 4); g.stroke(); g.fillText(v, px(v), T + S + 15); }
        g.textAlign = 'right'; for (let v = -3; v <= 3; v++) { g.beginPath(); g.moveTo(L, py(v)); g.lineTo(L - 4, py(v)); g.stroke(); g.fillText(v, L - 7, py(v) + 3); }
        for (const [x, y, c] of P) { g.beginPath(); g.arc(px(x), py(y), 4, 0, 7); g.fillStyle = c ? '#cba6f7' : '#89b4fa'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1; g.stroke(); }
        // title and legend inside the plot
        g.textAlign = 'left'; g.fillStyle = 'rgba(205,214,244,.85)'; g.font = '12px sans-serif'; g.fillText(names[ci], L + 8, T + 18);
        [['Class 1', '#cba6f7'], ['Class 0', '#89b4fa']].forEach(([s, c], k) => { g.beginPath(); g.arc(L + S - 62, T + 14 + k * 16, 4, 0, 7); g.fillStyle = c; g.fill(); g.fillStyle = 'rgba(205,214,244,.85)'; g.font = '11px sans-serif'; g.fillText(s, L + S - 54, T + 18 + k * 16); });
        const acc = P.filter(([x, y, c]) => (f(x, y) >= .5 ? 1 : 0) === c).length / P.length;
        q('#cb-ro').innerHTML = `Training accuracy <b>${Math.round(acc * 100)}%</b>`;
        const [d1, fm, nt] = info[names[ci]]; q('#cb-t').textContent = names[ci]; q('#cb-d1').textContent = d1; q('#cb-f').textContent = fm; q('#cb-n').textContent = nt;
      };
      pickIn(q, '#cb-c', i => { ci = i; draw(); }); pickIn(q, '#cb-d', i => { di = i; draw(); });
      draw();
    },

    // least-squares polynomial fits of 12 noisy points from a sine wave; degree 1 underfits, 11 passes through every point and overfits
    fitcompare(el) {
      const q = s => el.querySelector(s), r1 = seeded(41), r2 = seeded(42), nz = r => (r() + r() + r() - 1.5) * .8, tx = i => (i + .5) / 12, f0 = x => Math.sin(2 * Math.PI * x);
      const tr = Array.from({ length: 12 }, (_, i) => [tx(i), f0(tx(i)) + nz(r1)]), te = Array.from({ length: 40 }, (_, i) => [(i + .5) / 40, f0((i + .5) / 40) + nz(r2)]);
      const solve = (A, b) => { const n = b.length; for (let i = 0; i < n; i++) { let m = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r; [A[i], A[m]] = [A[m], A[i]]; [b[i], b[m]] = [b[m], b[i]]; for (let r = i + 1; r < n; r++) { const f = A[r][i] / A[i][i]; for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]; b[r] -= f * b[i]; } } const x = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c]; x[i] = s / A[i][i]; } return x; };
      const fit = d => { const V = tr.map(([x]) => Array.from({ length: d + 1 }, (_, k) => (2 * x - 1) ** k)), A = Array.from({ length: d + 1 }, (_, i) => Array.from({ length: d + 1 }, (_, j) => V.reduce((s, v) => s + v[i] * v[j], 0) + (i === j ? 1e-9 : 0))), b = Array.from({ length: d + 1 }, (_, i) => V.reduce((s, v, k) => s + v[i] * tr[k][1], 0)), c = solve(A, b); return x => c.reduce((s, ck, k) => s + ck * (2 * x - 1) ** k, 0); };
      const mse = (P, f) => P.reduce((s, [x, y]) => s + (f(x) - y) ** 2, 0) / P.length;
      const st = { pos: 3 }, W = 420, H = 220, sx = x => 20 + x * (W - 40), sy = y => H / 2 - Math.max(-2.2, Math.min(2.2, y)) / 2.2 * (H / 2 - 12);
      el.innerHTML = `<p class="wgt">Try it: fit a curve to the same 12 points</p>
        <div class="tb"><span>Model</span>${chips('fc-c', ['Underfit', 'Good fit', 'Overfit'], 1)}<span class="sp"></span>${btns('fc')}</div>
        <div class="tb ro"><label>Degree (curve flexibility) <input id="fc-d" type="range" min="1" max="11" value="3"></label><span id="fc-ro"></span></div>
        <svg viewBox="0 0 ${W} ${H}" class="fcsvg" id="fc-svg"></svg><p class="wgo" id="fc-n"></p>
        <p class="wgcap">Blue dots are the 12 points the model trains on, grey rings are 40 fresh points it has never seen, the faint line is the true pattern. The fit is a real least-squares polynomial, recomputed each time.</p>`;
      const draw = () => {
        const d = st.pos, f = fit(d), pts = Array.from({ length: 121 }, (_, i) => [i / 120, f(i / 120)]), etr = mse(tr, f), ete = mse(te, f);
        q('#fc-svg').innerHTML = `<line x1="20" y1="${sy(0)}" x2="${W - 20}" y2="${sy(0)}" stroke="var(--s1)"/>
          <polyline points="${Array.from({ length: 121 }, (_, i) => sx(i / 120) + ',' + sy(f0(i / 120))).join(' ')}" fill="none" stroke="var(--o0)" stroke-dasharray="3 3"/>
          <polyline points="${pts.map(([x, y]) => sx(x) + ',' + sy(y)).join(' ')}" fill="none" stroke="var(--peach)" stroke-width="2"/>
          ${te.map(([x, y]) => `<circle cx="${sx(x)}" cy="${sy(y)}" r="3" fill="none" stroke="var(--sub0)" opacity=".7"/>`).join('')}
          ${tr.map(([x, y]) => `<circle cx="${sx(x)}" cy="${sy(y)}" r="4.5" fill="var(--blue)"/>`).join('')}`;
        q('#fc-d').value = d;
        q('#fc-ro').innerHTML = `Train error <b>${etr.toFixed(2)}</b> · Test error <b>${ete.toFixed(2)}</b>`;
        q('#fc-n').textContent = d <= 1 ? 'Underfit: a straight line cannot follow a wave, so it is wrong everywhere, on training and new data alike.' : d <= 4 ? 'Good fit: it follows the real wave and ignores the noise, so train and test error are both low.' : d <= 7 ? 'Getting greedy: the curve is starting to chase individual points.' : 'Overfit: the curve bends through every training point (train error near zero) but swings wildly between them, so the test error shoots up.';
        q('#fc-c').querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === (d <= 1 ? 0 : d <= 4 ? 1 : d >= 10 ? 2 : -1)));
      };
      pickIn(q, '#fc-c', i => { st.pos = [1, 3, 11][i]; draw(); });
      q('#fc-d').oninput = e => { st.pos = +e.target.value; draw(); };
      wire(q, 'fc', st, 11, 450, () => { if (st.pos < 1) st.pos = 1; draw(); });
      draw();
    },

    // ---------- Generative models ----------
    // a real PCA latent space of 8x8 digits (a linear autoencoder): drag the probe, the decoder redraws the image
    latentexplorer(el) {
      el.innerHTML = `<p class="wgt">Try it: explore a latent space</p><p class="wgcap">Loading…</p>`;
      getJSON('assets/data/latent-pca.json').then(D => {
        const q = s => el.querySelector(s), col = ['red', 'peach', 'yellow', 'green', 'teal', 'sky', 'blue', 'lavender', 'mauve', 'pink'];
        const [x0, y0] = D.lo, [x1, y1] = D.hi, W = 300, Hh = 300, sx = v => 10 + (v - x0) / (x1 - x0) * (W - 20), sy = v => Hh - 10 - (v - y0) / (y1 - y0) * (Hh - 20);
        const cen = col.map((_, k) => { const p = D.pts.filter(a => a[2] === k); return [p.reduce((a, b) => a + b[0], 0) / p.length, p.reduce((a, b) => a + b[1], 0) / p.length]; });
        let pos = [0, 0];
        el.innerHTML = `<p class="wgt">Try it: explore a latent space</p>
          <div class="tb"><span>Click or drag in the plot to move the probe</span><span class="sp"></span>${bt('le-rand', 'Randomize', 'act')}${bt('le-reset', 'Reset')}</div>
          <div class="tb ro"><span id="le-ro"></span></div>
          <div class="lerow"><svg id="le-svg" viewBox="0 0 ${W} ${Hh}" class="lesvg"></svg><div><p class="wgt2">Decoded output (8×8)</p><div id="le-img"></div></div></div>
          <p class="wgcap">${D.pts.length} real digit images squeezed to 2 numbers each (PCA, which is a linear autoencoder, keeping ${Math.round(D.explained * 100)}% of the variation). The decoder rebuilds an 8×8 image from the two numbers at the probe. A real VAE is blurrier in a different way but behaves the same: nearby points decode to similar images.</p>`;
        const draw = () => {
          q('#le-svg').innerHTML = `<line x1="${sx(0)}" y1="0" x2="${sx(0)}" y2="${Hh}" stroke="var(--s1)"/><line x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}" stroke="var(--s1)"/>
            ${D.pts.map(p => `<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="3" fill="var(--${col[p[2]]})" opacity=".75"/>`).join('')}
            ${cen.map((c, k) => `<text x="${sx(c[0])}" y="${sy(c[1]) + 4}" font-size="13" font-weight="700" fill="var(--${col[k]})" text-anchor="middle">${k}</text>`).join('')}
            <circle cx="${sx(pos[0])}" cy="${sy(pos[1])}" r="8" fill="none" stroke="var(--text)" stroke-width="2"/>`;
          const img = D.mean.map((m, i) => m + pos[0] * D.c1[i] + pos[1] * D.c2[i]);
          q('#le-img').innerHTML = pg(img, 8, 16, lum);
          let best = 0, bd = 1e9; cen.forEach((c, k) => { const d = Math.hypot(c[0] - pos[0], c[1] - pos[1]); if (d < bd) { bd = d; best = k; } });
          q('#le-ro').innerHTML = `Probe at (<b>${pos[0].toFixed(1)}</b>, <b>${pos[1].toFixed(1)}</b>) · nearest cluster: digit <b>${best}</b> (distance ${bd.toFixed(1)})`;
        };
        const move = e => { const r = q('#le-svg').getBoundingClientRect(); pos = [x0 + ((e.clientX - r.left) / r.width * W - 10) / (W - 20) * (x1 - x0), y0 + ((Hh - 10 - (e.clientY - r.top) / r.height * Hh)) / (Hh - 20) * (y1 - y0)]; draw(); };
        let down = false; const s = q('#le-svg');
        s.onpointerdown = e => { down = true; s.setPointerCapture(e.pointerId); move(e); }; s.onpointermove = e => { if (down) move(e); }; s.onpointerup = () => down = false;
        q('#le-rand').onclick = () => { const p = D.pts[Math.floor(Math.random() * D.pts.length)]; pos = [p[0] + (Math.random() - .5) * 2, p[1] + (Math.random() - .5) * 2]; draw(); };
        q('#le-reset').onclick = () => { pos = [0, 0]; draw(); };
        draw();
      }).catch(failMsg(el, 'Try it: explore a latent space'));
    },

    // a real tiny GAN training run, recorded every 40 iterations: samples, both losses, and the discriminator's verdicts drifting to 50%
    ganreal(el) {
      el.innerHTML = `<p class="wgt">Try it: watch a GAN train</p><p class="wgcap">Loading…</p>`;
      getJSON('assets/data/gan-train.json').then(D => {
        const q = s => el.querySelector(s), E = D.frames.length - 1, st = { pos: 0 };
        el.innerHTML = `<p class="wgt">Try it: watch a GAN train</p>
          <div class="tb"><span>Generator vs discriminator</span><span class="sp"></span>${btns('gr')}</div>
          <div class="tb ro"><label>Training step <input id="gr-e" type="range" min="0" max="${E}" value="0"></label><span id="gr-ro"></span></div>
          <div class="stg"><div class="col"><p class="wgt2">Generated samples (same noise every time)</p><div class="gsm" id="gr-s"></div></div>
            <div class="plots" id="gr-p"></div></div><p class="wgo" id="gr-n"></p>
          <p class="wgcap">A real run, recorded once and replayed: ${D.model}, trained on ${D.data}, ${D.steps} iterations, one frame per ${D.every}. A GAN this small makes blobby digits and its losses wobble instead of settling: that wobble is normal.</p>`;
        const draw = () => {
          const t = st.pos;
          q('#gr-s').innerHTML = D.frames[t].map(f => pg([...f].map(c => +c / 9), 8, 8, lum)).join('');
          q('#gr-p').innerHTML = lines([{ v: D.g, c: 'red' }, { v: D.d, c: 'blue' }], 2.5, t, 'Loss (red = generator, blue = discriminator)', 'step ' + D.steps) + lines([{ v: D.dreal, c: 'green' }, { v: D.dfake, c: 'peach' }], 1, t, 'Discriminator output (green = real, orange = fake)', 'step ' + D.steps);
          q('#gr-e').value = t;
          q('#gr-ro').innerHTML = `Step <b>${t * D.every}</b> · G loss <b>${D.g[t].toFixed(2)}</b> · D loss <b>${D.d[t].toFixed(2)}</b> · D says real <b>${Math.round(D.dreal[t] * 100)}%</b>, fake <b>${Math.round(D.dfake[t] * 100)}%</b>`;
          q('#gr-n').textContent = t === 0 ? 'Step 0: the generator outputs noise and the discriminator has not learned anything yet (both outputs 50%).' : t < 5 ? 'Early: the discriminator quickly learns to tell real from fake, the generator is still making noise.' : `The generator keeps improving its fakes while the discriminator keeps adapting. When D's two verdicts get close to each other, it can barely tell real from fake.`;
        };
        q('#gr-e').oninput = ev => { st.pos = +ev.target.value; draw(); };
        wire(q, 'gr', st, E, 120, draw); draw();
      }).catch(failMsg(el, 'Try it: watch a GAN train'));
    },

    // forward noising of a real 8x8 digit with the DDPM formula x_t = sqrt(ab) x0 + sqrt(1-ab) eps; the reverse direction plays the same states backwards
    // ponytail: the reverse here is an ideal denoiser that already knows the noise; a real network has to predict it, and that prediction is what training teaches
    diffusionreal(el) {
      el.innerHTML = `<p class="wgt">Try it: add noise, then remove it</p><p class="wgcap">Loading…</p>`;
      getJSON('assets/data/cnn-train.json').then(D => {
        const q = s => el.querySelector(s), T = 1000, N = 20, st = { pos: 0 };
        let dg = 7, rev = false; const rnd = seeded(23), eps = Array.from({ length: 64 }, () => { let s = 0; for (let i = 0; i < 6; i++) s += rnd(); return (s - 3) * 1.41; });
        const ab = t => { let p = 1; for (let i = 0; i < t; i++) p *= 1 - (0.0001 + (0.02 - 0.0001) * i / (T - 1)); return p; };
        const img = t => D.samples[dg].map((v, i) => Math.max(0, Math.min(1, (Math.sqrt(ab(t)) * (2 * v - 1) + Math.sqrt(1 - ab(t)) * eps[i] + 1) / 2)));
        el.innerHTML = `<p class="wgt">Try it: add noise, then remove it</p>
          <div class="tb"><span>Digit</span>${chips('df-d', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], dg)}<span class="sp"></span>${btns('df')}</div>
          <div class="tb ro"><span>Direction</span>${chips('df-m', ['Add noise', 'Denoise'])}<label>Step t <input id="df-t" type="range" min="0" max="${N}" value="0"></label><span id="df-ro"></span></div>
          <div class="stg"><div class="col"><p class="wgt2">Now</p><div id="df-big"></div></div><div class="col"><p class="wgt2">The whole trip (t = 0, 250, 500, 750, 1000)</p><div class="dfrow" id="df-row"></div></div></div><p class="wgo" id="df-n"></p>
          <p class="wgcap">The noise-adding half is exact maths (a fixed schedule of 1000 small steps), applied to a real 8×8 digit. "Denoise" plays those same states backwards, as if the network guessed the noise perfectly. A real network only has a guess, which is what training improves.</p>`;
        const t = () => Math.round((rev ? N - st.pos : st.pos) / N * T);
        const draw = () => {
          const tt = t();
          q('#df-big').innerHTML = pg(img(tt), 8, 18, lum);
          q('#df-row').innerHTML = [0, 250, 500, 750, 1000].map(s => `<div class="${Math.abs(s - tt) < 26 ? 'on' : ''}">${pg(img(s), 8, 8, lum)}<small>t = ${s}</small></div>`).join('');
          q('#df-t').value = st.pos;
          q('#df-ro').innerHTML = `t = <b>${tt}</b> · signal left <b>${Math.round(Math.sqrt(ab(tt)) * 100)}%</b> · noise <b>${Math.round(Math.sqrt(1 - ab(tt)) * 100)}%</b>`;
          q('#df-n').textContent = tt === 0 ? 'Clear image.' : tt >= T ? 'Pure noise: nothing of the digit is left. Generation starts from here.' : rev ? 'Denoising: each step removes a little noise and the digit reappears.' : 'Each step adds a little more Gaussian noise.';
        };
        pickIn(q, '#df-d', i => { dg = i; draw(); });
        pickIn(q, '#df-m', i => { rev = !!i; st.pos = 0; draw(); });
        q('#df-t').oninput = ev => { st.pos = +ev.target.value; draw(); };
        wire(q, 'df', st, N, 250, draw); draw();
      }).catch(failMsg(el, 'Try it: add noise, then remove it'));
    },


    // ---------- LLM / RL ----------
    // real tabular Q-learning on a 5x5 grid, trained live in the page: arrows show the greedy policy, shading shows the best Q-value, the plot shows reward per episode
    qlearning(el) {
      const q = s => el.querySelector(s), N = 5, wall = new Set(['1,1', '2,1', '1,3', '3,3']), trap = '3,2', goal = '4,4';
      const D = [[0, -1], [1, 0], [0, 1], [-1, 0]], AR = ['↑', '→', '↓', '←'], EP = 200;
      const key = (x, y) => x + ',' + y;
      const step = (x, y, a) => { let nx = x + D[a][0], ny = y + D[a][1]; if (nx < 0 || ny < 0 || nx >= N || ny >= N || wall.has(key(nx, ny))) { nx = x; ny = y; } const k = key(nx, ny); return { x: nx, y: ny, r: k === goal ? 10 : k === trap ? -5 : -0.1, done: k === goal || k === trap }; };
      let Q, rnd, rets, ep, agent, steps, reward, timer, walkT, show = 0;
      const reset = () => { Q = {}; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) Q[key(x, y)] = [0, 0, 0, 0]; rnd = seeded(13); rets = []; ep = 0; agent = [0, 0]; steps = 0; reward = 0; clearInterval(timer); clearInterval(walkT); timer = walkT = null; };
      const best = k => { const v = Q[k]; return v.indexOf(Math.max(...v)); };
      const episode = () => { let x = 0, y = 0, R = 0; const eps = Math.max(.05, .4 * (1 - ep / EP)); for (let t = 0; t < 60; t++) { const k = key(x, y), a = rnd() < eps ? Math.floor(rnd() * 4) : best(k), s = step(x, y, a); Q[k][a] += .5 * (s.r + (s.done ? 0 : .9 * Math.max(...Q[key(s.x, s.y)])) - Q[k][a]); R += s.r; x = s.x; y = s.y; if (s.done) break; } rets.push(R); ep++; };
      el.innerHTML = `<p class="wgt">Try it: train an agent with Q-learning</p>
        <div class="tb"><span>Show</span>${chips('ql-s', ['Policy', 'Q-values'])}<span class="sp"></span>${bt('ql-train', 'Train', 'act')}${bt('ql-walk', 'Walk')}${bt('ql-reset', 'Reset')}</div>
        <div class="tb ro"><span id="ql-ro"></span></div>
        <div class="qlrow"><div class="qlgrid" id="ql-g"></div><div class="qlside"><p class="wgt2">Reward per episode</p><svg viewBox="0 0 300 130" id="ql-p"></svg>
          <ul class="qlkey"><li><i class="a"></i>Agent</li><li><i>★</i>Goal +10</li><li><i class="t">✕</i>Trap −5</li><li><i class="w"></i>Wall</li><li><i>·</i>Each step −0.1</li></ul></div></div>
        <p class="wgo" id="ql-n"></p>`;
      const draw = () => {
        const mx = Math.max(1, ...Object.entries(Q).filter(([k]) => k !== goal && k !== trap).map(([, v]) => Math.max(...v)));
        let g = '';
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const k = key(x, y), seen = Q[k].some(v => v !== 0), isA = agent[0] === x && agent[1] === y;
          let cls = 'qc', inner = '', bg = '';
          if (wall.has(k)) cls += ' w'; else if (k === goal) { cls += ' g'; inner = '★'; } else if (k === trap) { cls += ' t'; inner = '✕'; }
          else if (show === 0) inner = seen ? `<b>${AR[best(k)]}</b>` : '';
          else { const m = Math.max(...Q[k]); bg = `background:color-mix(in srgb,var(--green) ${Math.round(Math.max(0, m) / mx * 55)}%,var(--base))`; inner = `<small>${m.toFixed(1)}</small>`; }
          g += `<div class="${cls}" style="${bg}">${inner}${isA ? '<i class="ag"></i>' : ''}</div>`;
        }
        q('#ql-g').innerHTML = g;
        const w = 300, h = 130, n = Math.max(rets.length, 2), xs = i => 26 + i / (EP - 1) * (w - 36), ys = v => 112 - (Math.max(-6, Math.min(10, v)) + 6) / 16 * 100;
        const avg = rets.map((_, i) => { const s = rets.slice(Math.max(0, i - 9), i + 1); return s.reduce((a, b) => a + b, 0) / s.length; });
        q('#ql-p').innerHTML = `<line x1="26" y1="112" x2="${w - 10}" y2="112" stroke="var(--s1)"/><line x1="26" y1="12" x2="26" y2="112" stroke="var(--s1)"/><line x1="26" y1="${ys(0)}" x2="${w - 10}" y2="${ys(0)}" stroke="var(--s0)" stroke-dasharray="3 3"/>
          <polyline points="${rets.map((v, i) => xs(i) + ',' + ys(v)).join(' ')}" fill="none" stroke="var(--peach)" stroke-width="1" opacity=".5"/><polyline points="${avg.map((v, i) => xs(i) + ',' + ys(v)).join(' ')}" fill="none" stroke="var(--mauve)" stroke-width="2"/>
          <text x="22" y="${ys(10) + 3}" font-size="8" fill="var(--o0)" text-anchor="end">10</text><text x="22" y="${ys(0) + 3}" font-size="8" fill="var(--o0)" text-anchor="end">0</text><text x="22" y="${ys(-5) + 3}" font-size="8" fill="var(--o0)" text-anchor="end">−5</text><text x="${w - 10}" y="126" font-size="8" fill="var(--o0)" text-anchor="end">episode ${EP}</text>`;
        q('#ql-ro').innerHTML = `Episodes <b>${ep} / ${EP}</b> · Last reward <b>${rets.length ? rets[rets.length - 1].toFixed(1) : '0.0'}</b> · Walk: steps <b>${steps}</b>, reward <b>${reward.toFixed(1)}</b>`;
        q('#ql-n').textContent = ep === 0 ? 'Nothing learned yet: every Q-value is 0. Press Train to let the agent practise 200 episodes of trial and error.' : ep < EP ? 'Training: each episode the agent explores (sometimes at random), then nudges its Q-values toward what it just earned.' : 'Trained. The purple line is the average reward per episode: it climbs as the agent stops hitting the trap and finds the short route. Press Walk to watch it follow the arrows.';
      };
      pickIn(q, '#ql-s', i => { show = i; draw(); });
      q('#ql-train').onclick = () => { if (timer) { clearInterval(timer); timer = null; q('#ql-train').textContent = 'Train'; return; } if (ep >= EP) { reset(); } q('#ql-train').textContent = 'Pause'; timer = trackTimer(setInterval(() => { for (let i = 0; i < 4 && ep < EP; i++) episode(); draw(); if (ep >= EP) { clearInterval(timer); timer = null; q('#ql-train').textContent = 'Train'; } }, 60)); };
      q('#ql-walk').onclick = () => { clearInterval(walkT); agent = [0, 0]; steps = 0; reward = 0; draw(); walkT = trackTimer(setInterval(() => { if (steps >= 30) { clearInterval(walkT); return; } const s = step(agent[0], agent[1], best(key(agent[0], agent[1]))); agent = [s.x, s.y]; steps++; reward += s.r; draw(); if (s.done) clearInterval(walkT); }, 280)); };
      q('#ql-reset').onclick = () => { reset(); q('#ql-train').textContent = 'Train'; draw(); };
      reset(); draw();
    },

    // a toy tokenizer: it cuts text into the longest pieces it knows, with a space glued to the front of a piece (like GPT). Real tokenizers (BPE) learn 50,000+ pieces from data; the ids here are made up.
    tokenizer(el) {
      const q = s => el.querySelector(s), esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const V = new Set(('a an and are as at be but by can do for from has have he how i if in is it its of on or she so that the their then there they this to was we what when which who will with you your cat dog sat mat love like learn learning ai weather today hello world model data text token tokens word words answer answers question questions chat gpt sentence read reads machine neural network ' +
        'un re pre dis in im non over under out up down sub inter ing ed er est ly tion ation ization ness ment able ible al ous ive ful less ish ity ize s es ' +
        'straight forward stand fascin ating believ unbeliev understand').split(' '));
      const id = t => { let h = 7; for (const c of t) h = (h * 31 + c.charCodeAt(0)) % 50000; return h + 1; };
      const cols = ['blue', 'mauve', 'peach', 'green', 'pink', 'yellow'];
      // greedy longest match; a single leading space belongs to the piece after it
      const tok = txt => {
        const out = []; let i = 0;
        while (i < txt.length) {
          const sp = txt[i] === ' ' && i + 1 < txt.length && txt[i + 1] !== ' ' ? 1 : 0, st = i + sp;
          let n = 0;
          if (/[A-Za-z]/.test(txt[st] || '')) { for (let l = Math.min(14, txt.length - st); l > 0; l--) { const w = txt.slice(st, st + l); if (V.has(w.toLowerCase()) && /^[A-Za-z]+$/.test(w)) { n = l; break; } } if (!n) n = 1; }
          else n = 1;
          out.push(txt.slice(i, st + n)); i = st + n;
        }
        return out;
      };
      el.innerHTML = `<p class="wgt">Try it: how a model reads text</p>
        <div class="tb"><label>Text <input id="tz-in" type="text" value="Understanding AI is fascinating" style="width:300px"></label><span class="sp"></span>${bt('tz-1', 'Example', 'act')}${bt('tz-clear', 'Clear')}</div>
        <p class="wgt2">1. Cut into pieces</p><div class="tkx" id="tz-x"></div>
        <p class="wgt2">2. Every piece has a number</p><div class="toks" id="tz-t"></div>
        <p class="wgt2">3. What the model actually receives</p><div class="tkids" id="tz-i"></div>
        <div class="afrow" id="tz-st"></div>
        <p class="wgcap sm">A toy tokenizer: it cuts text into the longest pieces it knows, and a dot marks a space glued to the front of a piece. Real tokenizers learn tens of thousands of pieces from data and the numbers here are made up, but the idea is the same: text becomes a list of numbers.</p>`;
      const ex = ['Understanding AI is fascinating', 'The cat sat on the mat', 'Unbelievably straightforward tokenization', 'ChatGPT answers questions', 'Hello, world!'];
      let e = 0;
      const draw = () => {
        const s = q('#tz-in').value, t = tok(s), words = (s.match(/\S+/g) || []).length;
        q('#tz-x').innerHTML = t.length ? t.map((x, i) => `<span class="tki" data-i="${i}" style="--c:var(--${cols[i % 6]})">${esc(x)}</span>`).join('') : '<span class="dim">Type something above</span>';
        q('#tz-t').innerHTML = t.map((x, i) => `<div class="tk" data-i="${i}" style="--c:var(--${cols[i % 6]})"><b>${esc(x.replace(/^ /, '·'))}</b><small>${id(x.toLowerCase())}</small></div>`).join('');
        q('#tz-i').textContent = t.length ? '[' + t.map(x => id(x.toLowerCase())).join(', ') + ']' : '[]';
        q('#tz-st').innerHTML = `<div><span>Characters</span><small>letters, spaces, marks</small><b>${s.length}</b></div><div><span>Tokens</span><small>${t.length ? (s.length / t.length).toFixed(1) : '0'} characters per token</small><b>${t.length}</b></div><div><span>Words</span><small>split on spaces</small><b>${words}</b></div>`;
      };
      const hot = (ev, on) => { const n = ev.target.closest('[data-i]'); if (n) el.querySelectorAll(`[data-i="${n.dataset.i}"]`).forEach(x => x.classList.toggle('hot', on)); };
      el.addEventListener('mouseover', ev => hot(ev, true)); el.addEventListener('mouseout', ev => hot(ev, false));
      q('#tz-in').oninput = draw; q('#tz-clear').onclick = () => { q('#tz-in').value = ''; draw(); };
      q('#tz-1').onclick = () => { e = (e + 1) % ex.length; q('#tz-in').value = ex[e]; draw(); };
      draw();
    },

    // 2D word vectors with the classic analogy; the arithmetic and the nearest-word lookup are real, the vectors are hand-placed
    embedding(el) {
      const sets = [{ name: 'king / queen', w: { man: [.25, .2], woman: [.25, .65], king: [.8, .22], queen: [.82, .68], cat: [.08, .3], dog: [.18, .5] }, a: 'man', b: 'woman', c: 'king' },
        { name: 'Paris / Rome', w: { France: [.2, .15], Paris: [.2, .62], Italy: [.7, .18], Rome: [.7, .66], cat: [.5, .9], dog: [.55, .85] }, a: 'France', b: 'Paris', c: 'Italy' }];
      const cols = ['blue', 'mauve', 'peach', 'green', 'pink', 'yellow'], q = s => el.querySelector(s), st = { pos: 0 }; let si = 0;
      el.innerHTML = `<p class="wgt">Try it: words as directions</p>
        <div class="tb"><span>Analogy</span>${chips('em-c', sets.map(s => s.name))}<span class="sp"></span>${btns('em')}</div>
        <div class="tb ro"><span id="em-ro"></span></div><svg viewBox="0 0 360 220" class="emsvg" id="em-svg"></svg><p class="wgo" id="em-n"></p>
        <p class="wgcap">The vectors are hand-placed in 2D to show the idea; real embeddings have hundreds or thousands of dimensions and are learned from text. The subtraction, addition and nearest-word search below are real arithmetic.</p>`;
      const draw = () => {
        const S = sets[si], w = S.w, names = Object.keys(w), t = st.pos, px = v => 30 + v[0] * 300, py = v => 200 - v[1] * 190;
        const A = w[S.a], B = w[S.b], C = w[S.c], R = [C[0] - A[0] + B[0], C[1] - A[1] + B[1]];
        let near = '', nd = 9; names.forEach(n => { if (n === S.a || n === S.b || n === S.c) return; const d = Math.hypot(w[n][0] - R[0], w[n][1] - R[1]); if (d < nd) { nd = d; near = n; } });
        const arrow = (p, r, c) => `<line x1="${px(p)}" y1="${py(p)}" x2="${px(r)}" y2="${py(r)}" stroke="var(--${c})" stroke-width="2" marker-end="url(#ah)"/>`;
        q('#em-svg').innerHTML = `<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--peach)"/></marker></defs>
          <line x1="30" y1="200" x2="340" y2="200" stroke="var(--s1)"/><line x1="30" y1="10" x2="30" y2="200" stroke="var(--s1)"/>
          ${t >= 1 ? arrow(A, B, 'peach') : ''}${t >= 2 ? arrow(C, R, 'peach') : ''}${t >= 1 ? `<line x1="${px(A)}" y1="${py(A)}" x2="${px(C)}" y2="${py(C)}" stroke="var(--s1)" stroke-dasharray="4 3"/>` : ''}
          ${names.map((n, i) => `<circle cx="${px(w[n])}" cy="${py(w[n])}" r="6" fill="var(--${cols[i % 6]})"/><text x="${px(w[n]) + 9}" y="${py(w[n]) - 7}" font-size="12" fill="var(--text)">${n}</text><text x="${px(w[n]) + 9}" y="${py(w[n]) + 6}" font-size="8" fill="var(--o0)">[${w[n][0].toFixed(2)}, ${w[n][1].toFixed(2)}]</text>`).join('')}
          ${t >= 3 ? `<circle cx="${px(R)}" cy="${py(R)}" r="11" fill="none" stroke="var(--green)" stroke-width="2" stroke-dasharray="3 2"/>` : ''}`;
        q('#em-ro').innerHTML = t >= 2 ? `${S.c} − ${S.a} + ${S.b} = (<b>${R[0].toFixed(2)}</b>, <b>${R[1].toFixed(2)}</b>)${t >= 3 ? ` · nearest word: <b>${near}</b>` : ''}` : `${S.c} − ${S.a} + ${S.b} = ?`;
        q('#em-n').textContent = ['Each word is a point. Similar words sit near each other.', `Step 1: the direction from ${S.a} to ${S.b} captures one relationship.`, `Step 2: apply that same direction starting at ${S.c}.`, `Step 3: the nearest word to where you land is ${near}. That is how embeddings "do analogies".`][t];
        q('#em-c').querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === si));
      };
      pickIn(q, '#em-c', i => { si = i; st.pos = 0; draw(); });
      wire(q, 'em', st, 3, 1300, draw); draw();
    },

    // next-token playground with prompt, temperature and top-K; the logits are hand-set per prompt, the softmax / top-K / sampling are real
    tokenplay(el) {
      const prompts = [{ p: 'The weather today is', w: { nice: 3.3, sunny: 2.9, great: 3.0, beautiful: 2.4, warm: 1.9, perfect: 1.9, cloudy: 1.2, cold: 1.0, rainy: 0.6, windy: 0.5, hot: 0.4, terrible: 0.6, amazing: 0.2, horrible: -0.8, mild: -0.8 } },
        { p: 'The cat sat on the', w: { mat: 4.2, floor: 2.6, chair: 2.1, table: 1.8, roof: 0.6, sofa: 1.6, bed: 1.4, moon: -0.5, fence: 0.9, window: 1.1 } },
        { p: 'I like to eat', w: { pizza: 3.0, rice: 2.8, noodles: 2.7, fruit: 2.2, salad: 1.6, pasta: 2.4, cake: 1.9, bugs: -0.6, soup: 1.8, bread: 2.0 } }];
      const q = s => el.querySelector(s), rnd = seeded(17); let pi = 0, gen = [];
      el.innerHTML = `<p class="wgt">Try it: predict the next token</p>
        <div class="tb"><span>Prompt</span>${chips('tp-p', prompts.map(p => p.p))}<span class="sp"></span>${bt('tp-go', 'Generate', 'act')}${bt('tp-reset', 'Clear')}</div>
        <div class="tb ro"><label>Temperature <input id="tp-t" type="range" min="0.1" max="2" step="0.1" value="0.7"></label><b id="tp-tv"></b><label>Top-K <input id="tp-k" type="range" min="1" max="15" step="1" value="15"></label><b id="tp-kv"></b></div>
        <div id="tp-bars"></div><p class="wgo" id="tp-s"></p>
        <p class="wgcap">Low temperature makes the model confident and repetitive, high temperature creative and random. Top-K only lets the K most likely tokens compete. The scores are hand-set for each prompt, the softmax, top-K cut and the random draw are the real procedure.</p>`;
      const probs = () => {
        const t = +q('#tp-t').value, k = +q('#tp-k').value, ents = Object.entries(prompts[pi].w).sort((a, b) => b[1] - a[1]), z = ents.map(([, l]) => l / t), m = Math.max(...z), ex = z.map(v => Math.exp(v - m));
        const keep = ex.map((v, i) => i < k ? v : 0), s = keep.reduce((a, b) => a + b); return ents.map(([w], i) => [w, keep[i] / s]);
      };
      const draw = () => {
        const p = probs(), top = Math.max(...p.map(x => x[1]));
        q('#tp-tv').textContent = (+q('#tp-t').value).toFixed(1); q('#tp-kv').textContent = q('#tp-k').value;
        q('#tp-bars').innerHTML = p.map(([w, v]) => `<div class="tpr${v === 0 ? ' off' : ''}"><span>${w}</span><u><s style="width:${v / top * 100}%"></s></u><em>${(v * 100).toFixed(1)}%</em></div>`).join('');
        q('#tp-s').textContent = prompts[pi].p + ' ' + gen.join(' ') + ' …';
      };
      pickIn(q, '#tp-p', i => { pi = i; gen = []; draw(); });
      q('#tp-t').oninput = draw; q('#tp-k').oninput = draw;
      q('#tp-go').onclick = () => { const p = probs(); let r = rnd(), a = 0, pick = p[0][0]; for (const [w, v] of p) { a += v; if (r <= a) { pick = w; break; } } gen.push(pick); draw(); };
      q('#tp-reset').onclick = () => { gen = []; draw(); };
      draw();
    },
  };
})();
