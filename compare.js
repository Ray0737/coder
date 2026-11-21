/* Neural network comparison: pick two model types and see them side by side.
   All figures (parameters, layers, train time, MNIST accuracy, strengths, weaknesses, best for) follow the EASE AI
   comparison arena, ease-ai.academy/arena. The GAN has no accuracy there, so its bar stays empty. */
(() => {
  const $ = s => document.querySelector(s);
  const GROUPS = {
    'Classifiers': ['Logistic Regression', 'SVM', 'Decision Tree', 'KNN', 'MLP', 'CNN'],
    'Sequence Models': ['Simple RNN', 'LSTM', 'GRU', 'Transformer'],
    'Generative Models': ['Autoencoder', 'VAE', 'GAN'],
  };
  // blocks: [label, relative height]; net: neurons per column
  const M = {
    'Logistic Regression': { how: 'Multiplies every pixel by a weight, adds them up with a bias, and squashes the total with a sigmoid (or a softmax for the 10 digits) into a probability. Training nudges the weights so the right class scores higher. There is only one layer, so the boundary between two classes is always a straight line.', p: '7.8K', l: '1 (linear)', t: '<1s', a: 92.1, blocks: [['x', .5], ['σ', .5], ['ŷ', .4]],
      s: ['Extremely fast training', 'Fully interpretable', 'Good baseline'], w: ['Linear boundary only', 'Cannot learn XOR', 'Underfits complex data'], b: 'Linearly separable data, baselines, interpretability' },
    'SVM': { how: 'Looks for the line that separates the classes with the widest possible gap, called the margin. Only the points closest to the gap, the support vectors, decide where it goes. A kernel can lift the data into a higher dimension, so a flat cut there becomes a curved boundary back in the original space.', p: '~10K support vectors', l: '1 (kernel)', t: '~5s', a: 94.5, blocks: [['Input', 1], ['Kernel', .7], ['Margin', .5]],
      s: ['Maximum margin = robust', 'Kernel trick for non-linear', 'Works with small data'], w: ['Slow on large datasets', 'Hard to tune kernel/C', 'No probability output by default'], b: 'Small datasets, high-dimensional data, text classification' },
    'Decision Tree': { how: 'Asks a chain of yes or no questions about one feature at a time, such as whether one pixel is above 5. Each question splits the data in two, and the tree picks the question that makes the two groups purest. Following the answers from the top down to a leaf gives the class. A deeper tree fits more detail but starts to memorise.', p: '~2K nodes', l: 'Depth 10', t: '<1s', a: 87.8, blocks: [['Root', .5], ['Split', .7], ['Split', .7], ['Leaf', .45]],
      s: ['Fully interpretable (if-then)', 'No scaling needed', 'Handles mixed types'], w: ['Overfits easily', 'Axis-aligned splits only', 'Unstable (small data changes)'], b: 'Explainable AI, tabular data, feature importance' },
    'KNN': { how: 'Does no training: it simply keeps every example. To classify a new point it measures the distance to all the stored points, takes the K nearest (K = 3 here) and lets them vote. The majority class wins, so the answer depends only on who the neighbours are, and every prediction has to search the whole dataset.', p: '0 (stores all data)', l: 'None', t: '0s (lazy)', a: 96.9, blocks: [['Store data', 1], ['Distance', .7], ['K nearest', .55], ['Vote', .4]],
      s: ['No training needed', 'Simple & intuitive', 'Non-linear boundaries'], w: ['Slow at prediction time', 'Needs all data in memory', 'Curse of dimensionality'], b: 'Small datasets, prototyping, recommendation systems' },
    'MLP': { how: 'Stacks layers of neurons, where every neuron connects to every neuron in the next layer. Each neuron takes a weighted sum of its inputs and passes it through an activation such as ReLU, which lets the network bend its boundaries. Backpropagation then adjusts all the weights to shrink the error. The image is flattened into one long list first, so the position of each pixel is lost.', p: '235K', l: '3 (784→128→64→10)', t: '~30s', a: 97.2, net: [5, 4, 3, 2],
      s: ['Universal approximator', 'Learns non-linear boundaries', 'Foundation of deep learning'], w: ['No spatial awareness', 'Many parameters for images', 'Fully connected = inefficient'], b: 'Tabular data, non-linear classification, function approximation' },
    'CNN': { how: 'Slides small filters across the picture, and the same filter weights are reused at every position, so it finds edges wherever they are. Pooling shrinks the result and keeps the strongest signals. Early layers see edges, later layers see parts, and a final fully connected layer turns them into a class. Reusing the filters is why it needs so few parameters.', p: '62K', l: '5 (Conv→Pool→Conv→Pool→FC)', t: '~2min', a: 99.1, blocks: [['Conv', 1], ['Pool', .72], ['Conv', .86], ['Pool', .56], ['FC', .8], ['Out', .5]],
      s: ['Spatial awareness', 'Weight sharing = efficient', 'Translation invariant'], w: ['Needs spatial input', 'Fixed receptive field', 'Not good for sequences'], b: 'Images, spatial data, video frames' },
    'Simple RNN': { how: 'Reads the input one step at a time and keeps a hidden state that is fed back into itself, so every step sees the new input plus a summary of everything before. The same weights are used at every step, and that is the loop. Learning has to pass back through all those steps, and the signal fades on the way, so it forgets what happened far back.', p: '18K', l: '2 (RNN→FC)', t: '~1min', a: 89.3, blocks: [['h0', .6], ['h1', .6], ['h2', .6], ['h3', .6]],
      s: ['Handles variable length', 'Shared weights across time', 'Simple architecture'], w: ['Vanishing gradient', 'Forgets long-range info', 'Sequential = slow training'], b: 'Short sequences, simple time series' },
    'LSTM': { how: 'An RNN with a memory lane. A cell state runs along the whole sequence, and three gates (forget, input and output) decide what to erase, what to write and what to show. Because the cell state is changed only a little at each step, information and learning signals survive across many steps, which fixes the forgetting of a simple RNN.', p: '72K', l: '2 (LSTM→FC)', t: '~3min', a: 95.1, blocks: [['LSTM', .8], ['LSTM', .8], ['LSTM', .8]],
      s: ['Long-range memory', 'Gating prevents gradient vanishing', 'Cell state highway'], w: ['4x more params than RNN', 'Still sequential', 'Complex to implement'], b: 'Long sequences, text, speech, music generation' },
    'GRU': { how: 'A lighter LSTM. It merges the memory and the hidden state, and uses just two gates: update, which decides how much of the old memory to keep, and reset, which decides how much of the past to use when writing new content. Fewer gates means fewer parameters and faster training, with accuracy that is often close to an LSTM.', p: '54K', l: '2 (GRU→FC)', t: '~2.5min', a: 94.6, blocks: [['GRU', .8], ['GRU', .8], ['GRU', .8]],
      s: ['Simpler than LSTM (2 gates)', 'Fewer parameters', 'Similar performance'], w: ['No separate cell state', 'May underperform on very long sequences', 'Still sequential'], b: 'When LSTM is overkill, faster training needed' },
    'Transformer': { how: 'Does not read step by step. Self-attention lets every position look at every other position at once and weigh which ones matter, then a small feed-forward network (FFN) processes each position. Several attention and FFN blocks are stacked, with position information added because attention alone has no sense of order. Everything runs in parallel, which makes it fast to train on big data.', p: '310K', l: '4 (Attention×4→FC)', t: '~5min', a: 98.7, blocks: [['Attention', .75], ['FFN', .5], ['Attention', .75], ['FFN', .5]],
      s: ['Parallel processing', 'Global attention', 'No vanishing gradient'], w: ['O(n²) attention cost', 'Needs positional encoding', 'Data hungry'], b: 'NLP, translation, any long-range dependency task' },
    'Autoencoder': { how: 'An encoder squeezes the input into a small code, the latent vector z, and a decoder tries to rebuild the original from that code alone. The network is trained to make the rebuilt image match the input. Because the code is much smaller than the image, it can only keep what matters, which is why it works for compression and denoising.', p: '150K', l: '4 (Enc→Latent→Dec)', t: '~2min', a: 95.8, blocks: [['Enc', .9], ['z', .35], ['Dec', .9], ['x̂', .6]],
      s: ['Simple architecture', 'Good for compression', 'Deterministic'], w: ['Non-smooth latent space', 'Cannot sample new data', 'Blurry reconstructions'], b: 'Dimensionality reduction, denoising, anomaly detection' },
    'VAE': { how: 'Like an autoencoder, but the encoder outputs a mean (μ) and a spread (σ) instead of a single point. A code z is sampled from that bell curve (z ~ N) and the decoder rebuilds from it. A second loss, the KL divergence, keeps the codes close to a standard bell curve, so the space is smooth and you can sample new codes to generate new images.', p: '180K', l: '4 (Enc→μ,σ→Dec)', t: '~3min', a: 94.2, blocks: [['Enc', .9], ['μ, σ', .35], ['z ~ N', .35], ['Dec', .9], ['x̂', .6]],
      s: ['Smooth latent space', 'Can sample novel data', 'Mathematically principled'], w: ['Blurry outputs', 'KL divergence tricky to tune', 'Lower reconstruction quality'], b: 'Controlled generation, interpolation, drug discovery' },
    'GAN': { how: "Two networks play a game. The generator (G) turns random noise into a fake image, and the discriminator (D) tries to tell fake from real. D's verdict is the feedback that trains G to fool it, while D also gets better at spotting fakes. When the two stay in balance, G's fakes become sharp and realistic.", p: '400K (G+D)', l: '2 networks (Generator + Discriminator)', t: '~10min', a: null, blocks: [['G', .8], ['fake', .4], ['D', .8], ['Real / fake', .5]],
      s: ['Sharp, realistic outputs', 'Learns complex distributions', 'State-of-art image gen'], w: ['Mode collapse', 'Training instability', 'Hard to evaluate'], b: 'Image synthesis, super-resolution, style transfer' },
  };
  const group = n => Object.keys(GROUPS).find(g => GROUPS[g].includes(n)).replace(/s$/, '').replace('Sequence Model', 'Sequence').replace('Generative Model', 'Generative');
  const PRESETS = [['MLP', 'CNN'], ['Simple RNN', 'LSTM'], ['LSTM', 'Transformer'], ['VAE', 'GAN'], ['Logistic Regression', 'MLP']];
  const TAKE = {
    'MLP|CNN': 'CNN wins on images because weight sharing and local receptive fields exploit spatial structure. An MLP treats every pixel independently, with no awareness of its neighbours. For tabular data, though, an MLP can be the better choice, since there is no spatial structure to exploit.',
    'Simple RNN|LSTM': 'An LSTM beats a simple RNN because its gates let it keep information over long stretches, where a plain RNN forgets. The price is about four times the parameters and slower training.',
    'LSTM|Transformer': 'A Transformer reads every position at once, so it trains in parallel and keeps context across the whole input, while an LSTM walks through one step at a time. Transformers need much more data and memory to pay off. On a small task like MNIST, an LSTM is often enough.',
    'VAE|GAN': 'A VAE gives smooth, stable results but slightly blurry images. A GAN gives sharper images but is much harder to train, because the generator and the discriminator can fall out of balance. A GAN is not scored as a classifier, so it has no accuracy bar here.',
    'Logistic Regression|MLP': 'Logistic regression draws only straight boundaries, so it tops out near 92% on MNIST. Hidden layers let the MLP bend its boundaries and reach about 97%, at the cost of about 30 times the parameters.',
  };

  const diagram = m => {
    const w = 480, h = 160, hh0 = 130;
    if (m.net) {
      const n = m.net.length, gx = i => 70 + i * (w - 140) / (n - 1), gy = (i, j) => 80 + (j - (m.net[i] - 1) / 2) * 26;
      let lines = '', dots = '';
      for (let i = 0; i < n; i++) for (let j = 0; j < m.net[i]; j++) {
        if (i < n - 1) for (let k = 0; k < m.net[i + 1]; k++) lines += `<line x1="${gx(i)}" y1="${gy(i, j)}" x2="${gx(i + 1)}" y2="${gy(i + 1, k)}" stroke="var(--s1)"/>`;
        dots += `<circle cx="${gx(i)}" cy="${gy(i, j)}" r="9" fill="var(--crust)" stroke="var(--mauve)" stroke-width="1.5"/>`;
      }
      return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${hh0}">${lines}${dots}</svg>`;
    }
    const n = m.blocks.length, gap = 20, bw = Math.min(62, (w - 40 - (n - 1) * gap) / n), start = (w - (n * bw + (n - 1) * gap)) / 2;
    let out = '';
    m.blocks.forEach(([lab, hh], i) => {
      const x = start + i * (bw + gap), bh = 24 + 80 * hh, y = 68 - bh / 2;
      if (i) out += `<line x1="${x - gap}" y1="68" x2="${x}" y2="68" stroke="var(--s1)"/>`;
      out += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="none" stroke="var(--mauve)" stroke-width="1.5"/>`;
      const parts = lab.length > 9 && lab.includes(' ') ? [lab.slice(0, lab.indexOf(' ')), lab.slice(lab.indexOf(' ') + 1)] : [lab];
      out += `<text x="${x + bw / 2}" y="${142 + (parts.length > 1 ? -4 : 2)}" text-anchor="middle" font-size="12.5" fill="var(--o1)">${parts.map((p, k) => `<tspan x="${x + bw / 2}" dy="${k ? 13 : 0}">${p}</tspan>`).join('')}</text>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${hh0}">${out}</svg>`;
  };

  const card = (name, side) => {
    const m = M[name];
    return `<div class="ach"><div class="dd" data-side="${side}"></div><small>${group(name)}</small></div>
      <div class="nndiag">${diagram(m)}</div>
      <div class="ahow"><h4>How it works</h4><p>${m.how}</p></div>
      <div class="astat"><div><small>Parameters</small><b>${m.p}</b></div><div><small>Layers</small><b>${m.l.replace(/→/g, ' → ')}</b></div><div><small>Train time</small><b>${m.t}</b></div></div>
      <div class="aaw"><div class="aacc"><span>MNIST accuracy</span><b>${m.a === null ? 'Not a classifier' : m.a.toFixed(1) + '%'}</b></div>
      <div class="abar"><i class="${side}" style="width:${m.a === null ? 0 : m.a}%"></i></div></div>
      <div class="alist"><div><h4>Strengths</h4>${m.s.map(x => `<p class="pro">${x}</p>`).join('')}</div><div><h4>Weaknesses</h4>${m.w.map(x => `<p class="con">${x}</p>`).join('')}</div></div>
      <p class="abest"><b>Best for</b>${m.b}</p>`;
  };

  const takeaway = (a, b) => {
    const k = a + '|' + b, r = b + '|' + a;
    if (TAKE[k] || TAKE[r]) return TAKE[k] || TAKE[r];
    if (a === b) return `Both sides are ${a}. Pick a different model on one side to compare.`;
    const A = M[a], B = M[b];
    let s;
    if (A.a !== null && B.a !== null) {
      const hi = A.a >= B.a ? [a, A] : [b, B], lo = hi[0] === a ? [b, B] : [a, A];
      s = hi[1].a === lo[1].a ? `${a} and ${b} score the same on MNIST (${A.a}%).` : `${hi[0]} scores higher on MNIST, ${hi[1].a}% against ${lo[1].a}%.`;
    } else s = `MNIST accuracy only applies to classifiers, so ${A.a === null && B.a === null ? 'neither model' : (A.a === null ? a : b)} has no score here.`;
    return `${s} Training takes ${A.t} for ${a} and ${B.t} for ${b}. Pick ${a} for: ${A.b.charAt(0).toLowerCase() + A.b.slice(1)}. Pick ${b} for: ${B.b.charAt(0).toLowerCase() + B.b.slice(1)}.`;
  };

  // a plain dropdown in the site's own style: a button that opens a grouped list (arrow keys, Enter and Esc work)
  const dd = (root, get, set) => {
    root.innerHTML = `<button type="button" class="ddb" aria-haspopup="listbox" aria-expanded="false"><span></span><svg class="i"><use href="#i-caret-down"/></svg></button>
      <div class="ddl" role="listbox" hidden>${Object.entries(GROUPS).map(([g, ns]) => `<b>${g}</b>${ns.map(n => `<button type="button" role="option" data-v="${n}">${n}</button>`).join('')}`).join('')}</div>`;
    const btn = root.querySelector('.ddb'), list = root.querySelector('.ddl'), opts = [...list.querySelectorAll('[role=option]')];
    let at = 0;
    const mark = () => opts.forEach((o, i) => { o.classList.toggle('sel', o.dataset.v === get()); o.classList.toggle('act', i === at); });
    const open = v => { list.hidden = !v; btn.setAttribute('aria-expanded', v); if (v) { at = Math.max(0, opts.findIndex(o => o.dataset.v === get())); mark(); opts[at].scrollIntoView({ block: 'nearest' }); } };
    root.sync = () => { btn.firstElementChild.textContent = get(); mark(); };
    btn.onclick = () => open(list.hidden);
    list.onclick = e => { const o = e.target.closest('[role=option]'); if (o) { set(o.dataset.v); open(false); btn.focus(); } };
    btn.onkeydown = e => {
      if (e.key === 'Escape') open(false);
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (list.hidden) open(true); else { at = (at + (e.key === 'ArrowDown' ? 1 : opts.length - 1)) % opts.length; mark(); opts[at].scrollIntoView({ block: 'nearest' }); } }
      else if (e.key === 'Enter' && !list.hidden) { e.preventDefault(); set(opts[at].dataset.v); open(false); }
    };
    root.close = () => open(false);
    root.sync();
  };
  document.addEventListener('click', e => document.querySelectorAll('.dd').forEach(r => { if (!r.contains(e.target) && r.close) r.close(); }));
  let A = 'MLP', B = 'CNN';
  const hs = decodeURIComponent(location.hash.slice(1)).split(','); // compare.html#LSTM,GAN opens that pair
  if (M[hs[0]] && M[hs[1]]) [A, B] = hs;
  // the head-to-head as a small table: the higher accuracy is marked, and the gap is spelled out
  const headTable = () => {
    const a = M[A], b = M[B], both = a.a !== null && b.a !== null;
    const acc = (m, o) => m.a === null ? 'n/a' : `${m.a.toFixed(1)}%${o.a !== null && m.a > o.a ? ' <em>higher</em>' : ''}`;
    const gap = both && a.a !== b.a ? `${(Math.abs(a.a - b.a)).toFixed(1)} points in favour of ${a.a > b.a ? A : B}` : both ? 'Equal' : 'n/a';
    const row = (k, x, y) => `<tr><th>${k}</th><td>${x}</td><td>${y}</td></tr>`;
    return `<table class="htab"><tr><th></th><th>${A}</th><th>${B}</th></tr>${row('MNIST accuracy', acc(a, b), acc(b, a))}${row('Accuracy gap', `<span class="gapc">${gap}</span>`, '')}${row('Parameters', a.p, b.p)}${row('Train time', a.t, b.t)}</table>`;
  };
  const render = () => {
    $('#ar-ca').innerHTML = card(A, 'a'); $('#ar-cb').innerHTML = card(B, 'b');
    dd($('#ar-ca .dd'), () => A, v => { A = v; render(); });
    dd($('#ar-cb .dd'), () => B, v => { B = v; render(); });
    $('#ar-head').innerHTML = headTable();
    $('#ar-take').textContent = takeaway(A, B);
    document.querySelectorAll('#ar-pre button').forEach(x => x.classList.toggle('on', x.dataset.a === A && x.dataset.b === B));
  };
  $('#ar-pre').innerHTML = PRESETS.map(([a, b]) => `<button type="button" class="seg2" data-a="${a}" data-b="${b}">${a} vs ${b}</button>`).join('');
  $('#ar-pre').onclick = e => { const x = e.target.closest('button'); if (x) { A = x.dataset.a; B = x.dataset.b; render(); } };
  render();
})();
