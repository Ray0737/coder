// Circuit and Arduino wiring diagrams, in the same style as the L298N wiring in chapter.js:
// boxes for parts, coloured wires, small labels, and a legend under the picture.
// Loaded after widgets2.js, merged into the same `moreWidgets` registry.
(() => {
  const W = (d, c, w = 2.4) => `<path d="${d}" fill="none" stroke="var(--${c})" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const D = (x, y, c, r = 3.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--${c})"/>`;
  const T = (x, y, t, c = 'var(--text)', s = 8, a = 'middle') => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${s}" fill="${c}">${t}</text>`;
  const edge = 'color-mix(in srgb,var(--lavender) 28%,var(--crust))', faint = 'color-mix(in srgb,var(--lavender) 22%,var(--crust))';
  const box = (x, y, w, h, r = 6, f = 'var(--crust)', s = edge) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" stroke="${s}"/>`;
  const bt = (id, label, cls = '') => `<button class="bt ${cls}" id="${id}" type="button">${label}</button>`;
  const chips = (id, items, sel = 0) => `<span class="opts" id="${id}">${items.map((t, i) => `<button type="button" class="bt${i === sel ? ' on' : ''}" data-i="${i}">${t}</button>`).join('')}</span>`;
  const pick = (q, id, fn) => { q(id).onclick = e => { const b = e.target.closest('button'); if (!b) return; q(id).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); fn(+b.dataset.i); }; };
  const cell = (l, s, v) => `<div><span>${l}</span><small>${s}</small><b>${v}</b></div>`;
  const legend = items => `<div class="mwl">${items.map(([c, t]) => `<span><i style="background:var(--${c})"></i>${t}</span>`).join('')}</div>`;
  const rng = (id, label, min, max, step, val) => `<label>${label} <input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${val}"><b class="wgv" id="${id}v"></b></label>`;
  // a resistor drawn as a small box with its value, centred on (x, y)
  const res = (x, y, label, c = 'peach') => `${box(x - 20, y - 8, 40, 16, 3, 'var(--mantle)', `var(--${c})`)}${T(x, y + 3, label, 'var(--text)', 8)}`;
  const ohm = r => r >= 1000 ? (r / 1000).toFixed(r % 1000 ? 1 : 0).replace(/\.0$/, '') + 'kΩ' : Math.round(r) + 'Ω';

  // ---------- the Arduino Uno R3, drawn to scale: 68.6 x 53.3 mm, USB and power jack on the left edge ----------
  const SC = 7.4, OX = 70, OY = 24;                       // pixels per mm, and where the board's top-left corner sits
  const mx = v => +(OX + v * SC).toFixed(1), my = v => +(OY + v * SC).toFixed(1);
  const rect = (x, y, w, h) => ({ x: mx(x), y: my(y), w: +(w * SC).toFixed(1), h: +(h * SC).toFixed(1) });
  // every pin: [label, groups it belongs to]
  const TOP = [['SCL', 'i2c'], ['SDA', 'i2c'], ['AREF', ''], ['GND', 'power'], ['13', 'digital'], ['12', 'digital'], ['~11', 'digital pwm'], ['~10', 'digital pwm'], ['~9', 'digital pwm'], ['8', 'digital'],
    ['7', 'digital'], ['~6', 'digital pwm'], ['~5', 'digital pwm'], ['4', 'digital'], ['~3', 'digital pwm int'], ['2', 'digital int'], ['TX 1', 'digital serial'], ['RX 0', 'digital serial']];
  const PWR = [['', ''], ['IOREF', ''], ['RESET', ''], ['3V3', 'power'], ['5V', 'power'], ['GND', 'power'], ['GND', 'power'], ['VIN', 'power']];
  const ANA = [['A0', 'analog'], ['A1', 'analog'], ['A2', 'analog'], ['A3', 'analog'], ['A4', 'analog i2c'], ['A5', 'analog i2c']];
  const pcol = n => n[0] === '~' ? 'peach' : /^A\d$/.test(n) ? 'green' : ['3V3', '5V', 'VIN'].includes(n) ? 'red' : n === 'SCL' || n === 'SDA' ? 'teal' : /^(TX|RX)/.test(n) ? 'pink' : ['GND', 'AREF', 'RESET', 'IOREF', ''].includes(n) ? 'o0' : 'lavender';
  const topX = i => 17.1 + 2.54 * i + (i >= 10 ? 4.06 : 0);          // the gap between pins 8 and 7 is wider than the others, on the real board
  const Z = {
    usb: ['USB-B connector', 'The square silver socket. One cable gives the board 5 V of power, loads your sketch and carries the text of the Serial Monitor. Up to about 500 mA can be drawn from a computer\'s USB port.'],
    jack: ['Power jack', 'A 2.1 mm barrel socket with the plus on the centre pin. Feed it 7 to 12 V from an adapter or a battery pack when the board is away from the computer. If both the jack and the USB cable are plugged in, the board uses the jack.'],
    reg: ['Voltage regulator', 'Turns the higher voltage from the jack (or VIN) into a steady 5 V for the whole board. It gets warm when a high input voltage and a big load come together, so keep the adapter near 9 V.'],
    reset: ['Reset button', 'Starts the sketch again from the top, as if you had just plugged the board in. It does the same as joining the RESET pin to GND. Your sketch stays in memory.'],
    u2: ['ATmega16U2 (USB chip)', 'A second, smaller chip that turns USB into the serial signal the main chip understands. It is the reason you can upload and use the Serial Monitor. Cheaper copies of the board use a different chip here, such as the CH340, which needs its own driver.'],
    xtal: ['16 MHz crystal', 'A small metal can that gives the main chip its clock: 16 million ticks every second. Every delay() and every timing in your sketch is counted from this.'],
    mega: ['ATmega328P', 'The microcontroller that runs your sketch. It holds 32 KB of flash for the program, 2 KB of SRAM for variables and 1 KB of EEPROM for settings that survive a power-off. On many Unos it sits in a socket and can be pulled out.'],
    icsp: ['ICSP header', 'Six pins for programming the main chip directly with a programmer, instead of through USB. You use it to load a bootloader onto a bare chip. You will not need it in this course.'],
    leds: ['Status LEDs', 'L is joined to pin 13, so the Blink example works with nothing wired. TX and RX flicker when data moves over the USB cable, and ON shows that the board has power.'],
    digital: ['Digital header (top edge)', 'Left block, from the USB end: SCL, SDA, AREF, GND, then pins 13, 12, 11, 10, 9 and 8. Right block: pins 7, 6, 5, 4, 3, 2, 1 (TX) and 0 (RX).</p><p>Pins 3, 5, 6, 9, 10 and 11 can do PWM. Pins 2 and 3 can raise an interrupt. Pins 0 and 1 are shared with the USB serial port, so keep them free. SCL and SDA are the same lines as A5 and A4.'],
    power: ['Power header (bottom left)', 'From the left: one pin that is not connected, IOREF, RESET, 3V3, 5V, GND, GND and VIN.</p><p>5V and 3V3 are outputs for your parts, and GND is the return for all of them. VIN is the voltage that comes in from the jack. Pulling RESET to GND restarts the board. IOREF only tells a shield which voltage the board uses.'],
    analog: ['Analog header (bottom right)', 'Six pins in a row, A0 to A5, with A0 next to VIN.</p><p>Each reads a voltage between 0 and 5 V as a number from 0 to 1023. They can also act as digital pins 14 to 19, and A4 and A5 are the same pins as SDA and SCL for I2C.'],
  };
  // one drawing of the board. `at` is the part that is selected, `hl` is a pin group to keep bright (the pin map)
  const unoSvg = (at, hl) => {
    const faintL = 'color-mix(in srgb,var(--lavender) 28%,var(--crust))';
    const on = id => at === id;
    const g = (id, inner) => `<g data-id="${id}"${at === undefined ? '' : ' style="cursor:pointer"'}${hl ? ' opacity=".4"' : ''}>${inner}</g>`;
    const part = (id, r, label, sub, dash) => { const cx = r.x + r.w / 2, cy = r.y + r.h / 2; return g(id, `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="6" fill="var(--crust)" stroke="${on(id) ? 'var(--lavender)' : faintL}" stroke-width="${on(id) ? 1.5 : 1}"${dash ? ' stroke-dasharray="5 4"' : ''}/><text x="${cx}" y="${cy + (sub ? -1 : 3)}" text-anchor="middle" font-size="${r.w < 60 ? 8 : 10}" fill="var(--text)">${label}</text>${sub ? `<text x="${cx}" y="${cy + 11}" text-anchor="middle" font-size="7" fill="var(--o1)">${sub}</text>` : ''}`); };
    let s = `<rect x="${OX}" y="${OY}" width="${(68.6 * SC).toFixed(1)}" height="${(53.3 * SC).toFixed(1)}" rx="16" fill="var(--mantle)" stroke="${faintL}" stroke-width="1.5"/>`;
    [[14, 2.5], [15.3, 50.7], [66.1, 7.6], [66.1, 35.5]].forEach(([x, y]) => { s += `<circle cx="${mx(x)}" cy="${my(y)}" r="6" fill="var(--crust)" stroke="${faintL}"/>`; });
    s += `<text x="${mx(36)}" y="${my(26.5)}" text-anchor="middle" font-size="11" fill="var(--o0)"${hl ? ' opacity=".4"' : ''}>Arduino Uno R3</text>`;
    s += part('usb', rect(-5.5, 9.5, 16, 12), 'USB-B', 'power + upload');
    s += part('jack', rect(-2.5, 35, 14, 11), 'Power jack', '7-12 V');
    s += part('reset', rect(4.2, 3.3, 5, 5), 'Reset');
    s += part('reg', rect(14.4, 38.6, 6, 4), 'Reg.');
    s += part('u2', rect(21.2, 21, 5.8, 5.8), '16U2', 'USB chip');
    s += part('xtal', rect(21, 31.2, 6, 3), '16 MHz');
    s += part('mega', rect(30.5, 33.5, 26, 7.6), 'ATmega328P', 'main chip');
    s += part('icsp', rect(61.2, 22.5, 4, 6.6), 'ICSP');
    s += g('leds', `<rect x="${mx(27.4)}" y="${my(5.2)}" width="${(9.2 * SC).toFixed(1)}" height="${(4.6 * SC).toFixed(1)}" rx="6" fill="var(--crust)" stroke="${on('leds') ? 'var(--lavender)' : faintL}" stroke-width="${on('leds') ? 1.5 : 1}"/>`
      + [['L', 29, 'yellow'], ['TX', 31.6, 'green'], ['RX', 34.2, 'green']].map(([t, x, c]) => `<circle cx="${mx(x)}" cy="${my(6.6)}" r="3.2" fill="var(--${c})"/><text x="${mx(x)}" y="${my(8.9)}" text-anchor="middle" font-size="6.5" fill="var(--o1)">${t}</text>`).join('')
      + `<circle cx="${mx(60.4)}" cy="${my(35)}" r="3.2" fill="var(--green)"/><text x="${mx(60.4)}" y="${my(37.4)}" text-anchor="middle" font-size="6.5" fill="var(--o1)">ON</text>`);
    // the three pin headers
    const strip = (id, x1, x2, y, list, fx, lblY, stag = 0) => {
      const sx = mx(fx(0)) - 11, ex = mx(fx(list.length - 1)) + 11, hot = on(id);
      let h = `<rect x="${sx}" y="${my(y) - 11}" width="${ex - sx}" height="22" rx="6" fill="var(--crust)" stroke="${hot ? 'var(--lavender)' : faintL}" stroke-width="${hot ? 1.5 : 1}"/>`;
      list.forEach(([n, gr], i) => {
        const dim = hl && !gr.split(' ').includes(hl) ? ' opacity=".18"' : '';
        h += `<g${dim}><circle cx="${mx(fx(i))}" cy="${my(y)}" r="4.2" fill="var(--${pcol(n)})"/></g>`;
      });
      return `<g data-id="${id}"${at === undefined ? '' : ' style="cursor:pointer"'}>${h}</g>`;
    };
    s += strip('digital', 0, 0, 2.5, TOP.slice(0, 10), i => topX(i), 30, -11) + strip('digital', 0, 0, 2.5, TOP.slice(10), i => topX(i + 10), 30, -11);
    s += strip('power', 0, 0, 50.8, PWR, i => 30.5 + 2.54 * i, OY + 53.3 * SC + 22, 11);
    s += strip('analog', 0, 0, 50.8, ANA, i => 52.4 + 2.54 * i, OY + 53.3 * SC + 22);
    return s;
  };
  const pinLegend = () => legend([['lavender', 'digital pin'], ['peach', 'digital pin with PWM, marked ~'], ['green', 'analog input'], ['red', 'power out: 5V, 3V3, VIN'], ['teal', 'I2C: SCL and SDA'], ['pink', 'serial TX and RX'], ['o0', 'GND and the others']]);

  const widgets = {
    // the board, to scale: click a part
    arduinoboard(el) {
      const q = s => el.querySelector(s);
      let at = 'mega';
      const draw = () => { q('#ab-s').innerHTML = unoSvg(at); const z = Z[at]; q('#ab-d').innerHTML = `<b>${z[0]}</b><p>${z[1]}</p>`; };
      el.innerHTML = `<p class="wgt">Try it: click a part of the board</p>
        <svg id="ab-s" viewBox="0 0 640 440" width="100%"></svg><div class="hwd" id="ab-d"></div>${pinLegend()}`;
      q('#ab-s').onclick = e => { const g = e.target.closest('g[data-id]'); if (g && Z[g.dataset.id]) { at = g.dataset.id; draw(); } };
      el._reset = () => { at = 'mega'; draw(); }; draw();
    },

    // the pin map, filtered by what a pin can do
    arduinopins(el) {
      const q = s => el.querySelector(s);
      const say = ['Every labelled pin on the Uno.', 'Pins 0 to 13 work with pinMode, digitalWrite and digitalRead. Pins 0 and 1 are shared with the USB serial port, so leave them free while you upload.', 'Pins 3, 5, 6, 9, 10 and 11 can do analogWrite(). They are marked with a ~ on the board.', 'A0 to A5 read a voltage from 0 V to 5 V as a number from 0 to 1023 with analogRead().', 'A4 is SDA and A5 is SCL, and the same two lines are also brought out as SDA and SCL next to AREF. An I2C screen or sensor needs only these two and the power pins.', 'Pins 0 (RX) and 1 (TX) are the serial port that Serial.print and the Serial Monitor use.', 'Pins 2 and 3 can raise an interrupt, which runs a function the moment a pin changes.', '5V and 3V3 are power out, GND is the return path for all of them, and VIN is the voltage you feed in through the jack.'];
      const keys = [null, 'digital', 'pwm', 'analog', 'i2c', 'serial', 'int', 'power'];
      el.innerHTML = `<p class="wgt">Try it: what can each pin do?</p>
        <div class="tb">${chips('ap-c', ['All', 'Digital', 'PWM', 'Analog in', 'I2C', 'Serial', 'Interrupt', 'Power'])}</div>
        <svg id="ap-s" viewBox="0 0 640 440" width="100%"></svg><p class="wgsay" id="ap-t"></p>`;
      const draw = i => { q('#ap-s').innerHTML = unoSvg(undefined, keys[i]); q('#ap-t').textContent = say[i]; };
      pick(q, '#ap-c', draw); draw(0);
    },

    // which holes of a breadboard are joined: click a hole (each hole has a big invisible target)
    breadboard(el) {
      const q = s => el.querySelector(s), cols = 14, x0 = 96, dx = 34, dy = 22;
      const ry = r => 108 + r * dy + (r > 4 ? dy : 0);                 // rows a to j, with one extra step for the centre gap
      const railY = [34, 56, ry(9) + 52, ry(9) + 74];
      const hole = (g, x, y) => `<circle class="bv" data-g="${g}" cx="${x}" cy="${y}" r="5.5" fill="var(--mantle)" stroke="${faint}" stroke-width="1.2"/><circle class="bh" data-g="${g}" cx="${x}" cy="${y}" r="11" fill="transparent" style="cursor:pointer"/>`;
      let holes = '';
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < 10; r++) holes += hole(`c${c}${r > 4 ? 'b' : 'a'}`, x0 + c * dx, ry(r));
        ['rt1', 'rt2', 'rb1', 'rb2'].forEach((g, i) => { holes += hole(g, x0 + c * dx, railY[i]); });
      }
      const nums = Array.from({ length: cols }, (_, c) => T(x0 + c * dx, 88, c + 1, 'var(--o1)', 8)).join('');
      const labs = 'abcdefghij'.split('').map((ch, r) => T(x0 - 34, ry(r) + 3, ch, 'var(--o1)', 9)).join('');
      const rails = [['+', 'red'], ['\u2212', 'blue'], ['+', 'red'], ['\u2212', 'blue']].map(([s, c], i) => T(x0 - 34, railY[i] + 4, s, `var(--${c})`, 13)).join('');
      const gy = (ry(4) + ry(5)) / 2;
      el.innerHTML = `<p class="wgt">Try it: click a hole and see what it is joined to</p>
        <svg viewBox="0 0 640 ${railY[3] + 28}" width="100%" id="bb-s">${box(40, 10, 560, railY[3] + 8, 10)}${rails}${nums}${labs}
          <rect x="70" y="${gy - 4}" width="500" height="8" rx="4" fill="var(--crust)" stroke="${faint}"/>${T(586, gy + 3, 'gap', 'var(--o1)', 8, 'end')}${holes}</svg>
        <p class="wgsay" id="bb-t">Click any hole. The five holes of one column are joined, the two halves are not, and each power rail is joined along its whole length.</p>
        ${legend([['green', 'the holes joined to the one you clicked']])}`;
      const say = g => /^c/.test(g) ? 'These five holes (same column, same half) are one connection. Anything pushed into any of them is wired together. The two halves of a column are not joined, because of the gap in the middle.' : 'This is a power rail. Every hole along the whole strip is one connection, so a wire from 5V to the + rail gives 5V to every hole of that rail.';
      // the group under the pointer is previewed in lavender, the clicked group stays green
      let sel = null, hov = null;
      const paint = () => el.querySelectorAll('.bv').forEach(x => {
        const g = x.dataset.g, isSel = g === sel, isHov = g === hov;
        x.setAttribute('fill', isSel ? 'var(--green)' : isHov ? 'color-mix(in srgb,var(--lavender) 45%,var(--mantle))' : 'var(--mantle)');
        x.setAttribute('stroke', isHov && !isSel ? 'var(--lavender)' : faint);
        x.setAttribute('r', isSel ? 6.5 : isHov ? 6 : 5.5);
      });
      const grpOf = e => { const h = e.target.closest && e.target.closest('.bh'); return h ? h.dataset.g : null; };
      q('#bb-s').onmouseover = e => { const g = grpOf(e); if (g !== hov) { hov = g; paint(); } };
      q('#bb-s').onmouseleave = () => { hov = null; paint(); };
      q('#bb-s').onclick = e => {
        const g = grpOf(e); if (!g) return;
        sel = g; paint();
        q('#bb-t').textContent = say(g);
      };
    },

    // Ohm's law with a water picture
    ohmslaw(el) {
      const q = s => el.querySelector(s);
      el.innerHTML = `<p class="wgt">Try it: change the voltage and the resistance</p>
        <div class="tb">${rng('ol-v', 'Voltage', 1, 12, 0.5, 5)}${rng('ol-r', 'Resistance', 10, 1000, 10, 220)}</div>
        <svg viewBox="0 0 640 150" width="100%" id="ol-s"></svg><div class="afrow" id="ol-a"></div>`;
      const draw = () => {
        const v = +q('#ol-v').value, r = +q('#ol-r').value, i = v / r, p = v * i;
        q('#ol-vv').textContent = v + ' V'; q('#ol-rv').textContent = ohm(r);
        const bar = (y, w, c, l, t) => `${box(150, y, 340, 18, 5, 'var(--mantle)', faint)}<rect x="150" y="${y}" width="${w}" height="18" rx="5" fill="var(--${c})"/>${T(140, y + 13, l, 'var(--text)', 9, 'end')}${T(500, y + 13, t, 'var(--o1)', 8, 'start')}`;
        q('#ol-s').innerHTML = bar(14, v / 12 * 340, 'red', 'Pressure', 'voltage: how hard the battery pushes')
          + bar(54, Math.min(1, i / 0.1) * 340, 'blue', 'Flow', 'current: how much charge moves each second')
          + bar(94, r / 1000 * 340, 'peach', 'Narrow pipe', 'resistance: how much the part holds it back');
        q('#ol-a').innerHTML = cell('Current', 'I = V / R', (i * 1000).toFixed(i < .01 ? 2 : 1) + ' mA') + cell('Power', 'P = V x I', (p * 1000).toFixed(0) + ' mW') + cell('Check', 'V / R x R', (i * r).toFixed(1) + ' V');
      };
      q('#ol-v').oninput = q('#ol-r').oninput = draw; draw();
    },

    // series and parallel, drawn like the MLP diagram: a soft panel, thin grey wires, outlined nodes, one accent colour
    seriesparallel(el) {
      const q = s => el.querySelector(s);
      el.innerHTML = `<p class="wgt">Try it: two resistors on a 5 V supply</p>
        <div class="tb">${chips('sp-c', ['In series', 'In parallel'])}${rng('sp-1', 'R1', 100, 1000, 10, 220)}${rng('sp-2', 'R2', 100, 1000, 10, 470)}</div>
        <div class="nndiag"><svg viewBox="20 0 460 175" width="100%" style="max-height:190px" id="sp-s"></svg></div><div class="afrow" id="sp-a"></div>
        <p class="wgcap">The arrows show the current, from the battery's + side, round the loop and back to its - side.</p>`;
      let m = 0;
      // node: a rounded box with the value inside, in the same outline style as the MLP circles
      const node = (x, y, txt, c = 'var(--sub0)', w = 56) => `<rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="8" fill="var(--base)" stroke="${c}" stroke-width="1.5"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" fill="var(--text)">${txt}</text>`;
      const lab = (x, y, t, a = 'middle') => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="11" fill="var(--o1)">${t}</text>`;
      const arrow = (x, y, d) => { const p = { r: '-3,-4 -3,4 4,0', l: '3,-4 3,4 -4,0', d: '-4,-3 4,-3 0,4', u: '-4,3 4,3 0,-4' }[d]; return `<polygon transform="translate(${x} ${y})" points="${p}" fill="var(--mauve)"/>`; };
      const wire = d => `<path d="${d}" fill="none" stroke="var(--s1)" stroke-width="1.5" stroke-linejoin="round"/>`;
      const battery = node(60, 95, '5 V', 'var(--mauve)', 52);
      const draw = () => {
        const r1 = +q('#sp-1').value, r2 = +q('#sp-2').value;
        q('#sp-1v').textContent = ohm(r1); q('#sp-2v').textContent = ohm(r2);
        let s, a;
        if (!m) {
          const rt = r1 + r2, i = 5 / rt, v1 = i * r1, v2 = i * r2;
          s = wire('M60 82 V48 Q60 38 70 38 H430 Q440 38 440 48 V142 Q440 152 430 152 H70 Q60 152 60 142 V108')
            + arrow(390, 38, 'r') + arrow(440, 95, 'd') + arrow(260, 152, 'l')
            + node(190, 38, ohm(r1)) + node(330, 38, ohm(r2)) + battery
            + lab(190, 20, 'R1') + lab(330, 20, 'R2') + lab(190, 70, v1.toFixed(2) + ' V') + lab(330, 70, v2.toFixed(2) + ' V')
            + lab(260, 108, (i * 1000).toFixed(1) + ' mA') + lab(260, 126, 'the same in both', 'middle');
          a = cell('Total resistance', 'R1 + R2', ohm(rt)) + cell('Current', 'the same in both', (i * 1000).toFixed(1) + ' mA') + cell('Voltage on R1', 'it shares the 5 V', v1.toFixed(2) + ' V') + cell('Voltage on R2', 'what is left', v2.toFixed(2) + ' V');
        } else {
          const rt = 1 / (1 / r1 + 1 / r2), i = 5 / rt, i1 = 5 / r1, i2 = 5 / r2;
          s = wire('M60 82 V48 Q60 38 70 38 H430 Q440 38 440 48 V142 Q440 152 430 152 H70 Q60 152 60 142 V108')
            + wire('M190 38 V152') + wire('M340 38 V152')
            + `<circle cx="190" cy="38" r="3" fill="var(--sub0)"/><circle cx="340" cy="38" r="3" fill="var(--sub0)"/><circle cx="190" cy="152" r="3" fill="var(--sub0)"/><circle cx="340" cy="152" r="3" fill="var(--sub0)"/>`
            + arrow(125, 38, 'r') + arrow(265, 38, 'r') + arrow(390, 38, 'r') + arrow(190, 70, 'd') + arrow(340, 70, 'd') + arrow(440, 95, 'd') + arrow(265, 152, 'l')
            + node(190, 95, ohm(r1)) + node(340, 95, ohm(r2)) + battery
            + lab(232, 91, 'R1', 'start') + lab(232, 107, (i1 * 1000).toFixed(1) + ' mA', 'start') + lab(382, 91, 'R2', 'start') + lab(382, 107, (i2 * 1000).toFixed(1) + ' mA', 'start')
            + lab(265, 20, 'each road has the full 5 V', 'middle');
          a = cell('Total resistance', '1 / (1/R1 + 1/R2)', ohm(rt)) + cell('Total current', 'the two add up', (i * 1000).toFixed(1) + ' mA') + cell('Through R1', '5 V / R1', (i1 * 1000).toFixed(1) + ' mA') + cell('Through R2', '5 V / R2', (i2 * 1000).toFixed(1) + ' mA');
        }
        q('#sp-s').innerHTML = s; q('#sp-a').innerHTML = a;
      };
      pick(q, '#sp-c', i => { m = i; draw(); });
      q('#sp-1').oninput = q('#sp-2').oninput = draw; draw();
    },

    // where the multimeter goes: straight probes, with every part and probe labelled
    multimeter(el) {
      const q = s => el.querySelector(s);
      const say = ['Voltage: put the meter ACROSS the part, one probe on each side, with the circuit running. The meter is a branch next to the part, not in its way.', 'Current: BREAK the wire and put the meter IN the road, so every bit of current has to pass through it. Never do this on the voltage setting, because the meter becomes a short circuit.', 'Resistance: switch the power OFF and take the part out of the circuit, or the other parts change the reading. The meter sends its own tiny current.'];
      el.innerHTML = `<p class="wgt">Try it: where does the meter go?</p>
        <div class="tb">${chips('mm-c', ['Voltage', 'Current', 'Resistance'])}</div>
        <div class="nndiag"><svg viewBox="20 0 460 200" width="100%" style="max-height:215px" id="mm-s"></svg></div><p class="wgsay" id="mm-t"></p>`;
      const node = (x, y, txt, c = 'var(--sub0)', w = 56) => `<rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="8" fill="var(--base)" stroke="${c}" stroke-width="1.5"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" fill="var(--text)">${txt}</text>`;
      const lab = (x, y, t, a = 'middle', c = 'var(--o1)') => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="11" fill="${c}">${t}</text>`;
      const wire = (d, c = 'var(--s1)') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/>`;
      const RED = 'var(--red)', BLK = 'var(--text)';
      const loop = 'M60 87 V50 Q60 40 70 40 H430 Q440 40 440 50 V150 Q440 160 430 160 H70 Q60 160 60 150 V113';
      const dot = (x, y, c) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${c}"/>`;
      // the meter body: a symbol, the two sockets on its top edge and the dial setting under it
      const body = (cx, cy, w, sym, dial) => `<rect x="${cx - w / 2}" y="${cy - 15}" width="${w}" height="30" rx="7" fill="var(--base)" stroke="var(--mauve)" stroke-width="1.5"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="14" fill="var(--text)">${sym}</text>${lab(cx, cy + 30, dial)}`;
      const battery = node(60, 100, '5 V', 'var(--mauve)', 52) + lab(60, 140, 'battery') + lab(46, 80, '+', 'end', RED) + lab(46, 124, '\u2212', 'end', 'var(--blue)');
      const draw = i => {
        let s = '';
        if (i === 0) s = wire(loop) + node(190, 40, '220\u03a9') + lab(190, 20, 'resistor') + node(330, 40, 'LED', 'var(--sub0)', 44) + battery
          + wire('M140 95 V40', RED) + wire('M240 95 V40', BLK) + dot(140, 40, RED) + dot(240, 40, BLK)
          + body(190, 110, 116, 'V', 'dial: DC volts')
          + dot(140, 95, RED) + dot(240, 95, BLK) + lab(147, 88, 'V\u03a9', 'start', RED) + lab(233, 88, 'COM', 'end')
          + lab(132, 70, 'red probe', 'end') + lab(248, 70, 'black probe', 'start') + lab(190, 70, 'across the part');
        if (i === 1) s = wire(loop) + node(250, 40, '220\u03a9') + lab(250, 20, 'resistor') + node(360, 40, 'LED', 'var(--sub0)', 44) + battery
          + wire('M60 87 V50 Q60 40 70 40 H105', RED) + wire('M175 40 H222', BLK)
          + body(140, 40, 70, 'A', 'dial: amps') + dot(105, 40, RED) + dot(175, 40, BLK)
          + lab(82, 62, 'red', 'middle', RED) + lab(199, 62, 'black') + lab(140, 14, 'meter in the line');
        if (i === 2) s = node(250, 60, '220\u03a9') + lab(250, 30, 'resistor, taken out') + wire('M160 60 H222', 'var(--s1)') + wire('M278 60 H340', 'var(--s1)')
          + wire('M212 60 V130', RED) + wire('M288 60 V130', BLK) + dot(212, 60, RED) + dot(288, 60, BLK)
          + body(250, 145, 116, '\u03a9', 'dial: ohms') + dot(212, 130, RED) + dot(288, 130, BLK) + lab(219, 123, 'V\u03a9', 'start', RED) + lab(281, 123, 'COM', 'end')
          + lab(204, 98, 'red probe', 'end') + lab(296, 98, 'black probe', 'start') + lab(350, 64, 'power off', 'start', RED);
        q('#mm-s').innerHTML = s; q('#mm-t').textContent = say[i];
      };
      pick(q, '#mm-c', draw); draw(0);
    },

    // PWM: the pin only flips between 0 V and 5 V, and the average is what a part sees
    pwmwave(el) {
      const q = s => el.querySelector(s);
      el.innerHTML = `<p class="wgt">Try it: analogWrite on a pin</p>
        <div class="tb">${rng('pw-v', 'Value', 0, 255, 5, 128)}</div>
        <div class="nndiag"><svg viewBox="0 0 580 190" width="100%" id="pw-s"></svg></div><div class="afrow" id="pw-a"></div>
        <p class="wgcap">The pin is only ever fully HIGH (5 V) or fully LOW (0 V). It flips about 490 times a second, so fast that an LED or a motor only sees the average.</p>`;
      const lab = (x, y, t, a = 'middle', c = 'var(--o1)', s = 10) => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${s}" fill="${c}">${t}</text>`;
      const draw = () => {
        const v = +q('#pw-v').value, d = v / 255, X0 = 56, P = 96, HI = 44, LO = 124, ya = LO - d * (LO - HI);
        q('#pw-vv').textContent = v;
        let p = `M${X0} ${LO}`;
        if (d >= 1) p = `M${X0} ${HI} H${X0 + 4 * P}`; else for (let k = 0; k < 4; k++) { const x = X0 + k * P; if (d > 0) p += ` V${HI} H${(x + d * P).toFixed(1)}`; p += ` V${LO} H${x + P}`; }
        const on = d * P;
        q('#pw-s').innerHTML = `<line x1="${X0}" y1="${HI}" x2="${X0 + 4 * P}" y2="${HI}" stroke="var(--s1)" stroke-dasharray="3 4"/><line x1="${X0}" y1="${LO}" x2="${X0 + 4 * P}" y2="${LO}" stroke="var(--s1)"/>
          ${lab(48, HI + 4, '5 V', 'end')}${lab(48, LO + 4, '0 V', 'end')}
          <path d="${p}" fill="none" stroke="var(--peach)" stroke-width="2" stroke-linejoin="round"/>
          <path d="M${X0} 28 V22 H${X0 + P} V28" fill="none" stroke="var(--s1)"/>${lab(X0 + P / 2, 16, 'one period, about 2 ms')}
          ${d > 0 ? `<path d="M${X0} 140 V146 H${(X0 + on).toFixed(1)} V140" fill="none" stroke="var(--peach)"/>` : ''}${lab(X0 + (d > 0 ? Math.max(on / 2, 24) : 0), 162, d > 0 ? 'HIGH ' + Math.round(d * 100) + '% of the time' : 'always LOW', d > 0 ? 'start' : 'start', 'var(--peach)')}
          <line x1="${X0}" y1="${ya}" x2="${X0 + 4 * P}" y2="${ya}" stroke="var(--mauve)" stroke-width="1.5" stroke-dasharray="6 4"/>
          ${lab(X0 + 4 * P + 8, ya - 3, 'average', 'start', 'var(--mauve)')}${lab(X0 + 4 * P + 8, ya + 10, (5 * d).toFixed(2) + ' V', 'start', 'var(--mauve)')}
          <circle cx="536" cy="84" r="${(12 + d * 8).toFixed(1)}" fill="var(--yellow)" fill-opacity="${(0.06 + d * 0.94).toFixed(2)}" stroke="var(--yellow)" stroke-width="1.5"/>${lab(536, 126, 'LED')}`;
        q('#pw-a').innerHTML = cell('The call', 'on a ~ pin', `<span style="white-space:nowrap;font-size:14px">analogWrite(9,&nbsp;${v})</span>`) + cell('Duty cycle', 'time spent HIGH', Math.round(d * 100) + '%') + cell('Average voltage', '5 V x duty', (5 * d).toFixed(2) + ' V') + cell('LED', 'looks like', d === 0 ? 'off' : d === 1 ? 'full' : Math.round(d * 100) + '% bright');
      };
      q('#pw-v').oninput = draw; draw();
    },

    // LED: active high or active low
    ledwire(el) {
      const q = s => el.querySelector(s);
      el.innerHTML = `<p class="wgt">Try it: wire an LED both ways, then write the pin</p>
        <div class="tb">${chips('lw-c', ['Active high: pin to LED to GND', 'Active low: 5V to LED to pin'])}${bt('lw-b', 'digitalWrite(8, HIGH)', 'act')}</div>
        <svg viewBox="0 0 640 200" width="100%" id="lw-s"></svg><p class="wgsay" id="lw-t"></p>
        ${legend([['green', 'current is flowing'], ['o0', 'no current'], ['red', '5 V']])}`;
      let m = 0, hi = true;
      const draw = () => {
        const on = m === 0 ? hi : !hi, w = on ? 'green' : 'o0';
        q('#lw-b').textContent = `digitalWrite(8, ${hi ? 'HIGH' : 'LOW'})`;
        const led = (x, y) => `<polygon points="${x - 12},${y - 12} ${x - 12},${y + 12} ${x + 12},${y}" fill="var(--yellow)" fill-opacity="${on ? 1 : .15}" stroke="var(--yellow)"/><line x1="${x + 12}" y1="${y - 12}" x2="${x + 12}" y2="${y + 12}" stroke="var(--yellow)" stroke-width="2.4"/>${on ? `<circle cx="${x}" cy="${y}" r="26" fill="var(--yellow)" fill-opacity=".18"/>` : ''}${T(x, y + 30, 'LED', 'var(--o1)', 8)}${T(x - 22, y - 8, '+', 'var(--o1)', 8)}${T(x + 22, y - 8, '-', 'var(--o1)', 8)}`;
        let s = `${box(30, 20, 120, 160, 10)}${T(90, 40, 'Arduino Uno', 'var(--text)', 10)}${D(150, 70, 'lavender')}${T(142, 74, 'pin 8', 'var(--text)', 8, 'end')}${D(150, 110, 'red')}${T(142, 114, '5V', 'var(--text)', 8, 'end')}${D(150, 150, 'o0')}${T(142, 154, 'GND', 'var(--text)', 8, 'end')}`;
        if (m === 0) s += `${W('M150 70 H220', w)}${res(240, 70, '220Ω')}${W('M260 70 H388', w)}${led(400, 70)}${W('M412 70 H470 V150 H150', w)}${T(470, 175, 'current goes from pin 8 to GND', 'var(--o1)', 8, 'end')}`;
        else s += `${W('M150 110 H220', 'red')}${res(240, 110, '220Ω')}${W('M260 110 H388', on ? 'red' : 'o0')}${led(400, 110)}${W('M412 110 H470 V70 H150', w)}${T(470, 175, 'current goes from 5V into pin 8', 'var(--o1)', 8, 'end')}`;
        q('#lw-s').innerHTML = s;
        q('#lw-t').textContent = m === 0 ? (hi ? 'HIGH puts 5 V on the pin. Current flows through the resistor and the LED to GND, so the LED is ON.' : 'LOW puts 0 V on the pin. There is no push, so no current flows and the LED is OFF.') : (hi ? 'HIGH puts 5 V on the pin, the same as the 5V side of the LED. Nothing pushes current through, so the LED is OFF.' : 'LOW puts 0 V on the pin, so current runs from 5V through the LED into the pin. The LED is ON. This is active low.');
      };
      pick(q, '#lw-c', i => { m = i; draw(); });
      q('#lw-b').onclick = () => { hi = !hi; draw(); }; draw();
    },

    // button: pull-up and pull-down, in the same loop design and size as the series and multimeter diagrams
    buttonwire(el) {
      const q = s => el.querySelector(s);
      el.innerHTML = `<p class="wgt">Try it: wire a button two ways, then press it</p>
        <div class="tb">${chips('bw-c', ['Pull-up: button to GND', 'Pull-down: button to 5V'])}${bt('bw-b', 'Press the button', 'act')}</div>
        <div class="nndiag"><svg viewBox="20 0 460 175" width="100%" style="max-height:190px" id="bw-s"></svg></div><div class="afrow" id="bw-a"></div>`;
      let m = 0, down = false;
      const node = (x, y, txt, c = 'var(--sub0)', w = 56) => `<rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="8" fill="var(--base)" stroke="${c}" stroke-width="1.5"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" fill="var(--text)">${txt}</text>`;
      const lab = (x, y, t, a = 'middle', c = 'var(--o1)', s = 11) => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${s}" fill="${c}">${t}</text>`;
      const wire = (d, on) => `<path d="${d}" fill="none" stroke="${on ? 'var(--mauve)' : 'var(--s1)'}" stroke-width="${on ? 2 : 1.5}" stroke-linejoin="round"/>`;
      const arrow = (x, y, d) => `<polygon transform="translate(${x} ${y})" points="${{ r: '-3,-4 -3,4 4,0', l: '3,-4 3,4 -4,0', d: '-4,-3 4,-3 0,4' }[d]}" fill="var(--mauve)"/>`;
      const draw = () => {
        q('#bw-b').textContent = down ? 'Release the button' : 'Press the button';
        const flow = down;                                                  // current runs round the loop only while the button is pressed
        const val = m === 0 ? (down ? 0 : 1) : (down ? 1 : 0);
        const loop = 'M60 82 V48 Q60 38 70 38 H430 Q440 38 440 48 V142 Q440 152 430 152 H70 Q60 152 60 142 V108';
        const btn = x => node(x, 38, down ? 'pressed' : 'open', down ? 'var(--mauve)' : 'var(--sub0)');
        let s = wire(loop, flow) + wire('M250 38 V82', false) + `<circle cx="250" cy="38" r="3.5" fill="var(--${flow ? 'mauve' : 'sub0'})"/>`;
        s += node(60, 95, '5 V', 'var(--mauve)', 52);
        // pull-up: resistor, tap to the pin, button.  pull-down: button, tap to the pin, resistor
        s += m === 0 ? node(170, 38, '~20 k\u03a9') + btn(330) : btn(170) + node(330, 38, '10 k\u03a9');
        s += m === 0 ? lab(170, 20, 'resistor') + lab(170, 66, 'inside the chip') + lab(330, 20, 'button') + lab(330, 66, 'you add this') : lab(170, 20, 'button') + lab(170, 66, 'you add this') + lab(330, 20, 'resistor') + lab(330, 66, 'you add this');
        s += node(250, 95, m === 0 ? 'pin 2' : 'pin 3', val ? 'var(--mauve)' : 'var(--sub0)', 56) + lab(250, 124, 'reads ' + (val ? 'HIGH' : 'LOW'), 'middle', val ? 'var(--mauve)' : 'var(--o1)') + lab(250, 138, val ? '(about 5 V)' : '(about 0 V)', 'middle', 'var(--o1)', 9);
        if (flow) s += arrow(110, 38, 'r') + arrow(390, 38, 'r') + arrow(440, 95, 'd') + arrow(260, 152, 'l');
        q('#bw-s').innerHTML = s;
        q('#bw-a').innerHTML = cell('Wiring', m === 0 ? 'INPUT_PULLUP' : 'INPUT + 10k resistor', m === 0 ? 'pull-up' : 'pull-down') + cell('Idle reads', 'button not pressed', m === 0 ? 'HIGH' : 'LOW') + cell('Pressed reads', 'button pressed', m === 0 ? 'LOW' : 'HIGH') + cell('Right now', down ? 'pressed' : 'released', `<span style="white-space:nowrap;font-size:14px">digitalRead&nbsp;=&nbsp;${val ? 'HIGH' : 'LOW'}</span>`);
      };
      pick(q, '#bw-c', i => { m = i; draw(); });
      q('#bw-b').onclick = () => { down = !down; draw(); }; draw();
    },

    // the voltage divider
    divider(el) {
      const q = s => el.querySelector(s);
      el.innerHTML = `<p class="wgt">Try it: a voltage divider into A0</p>
        <div class="tb">${chips('dv-c', ['Two resistors', 'Fixed resistor + LDR'])}<span id="dv-ctl"></span></div>
        <svg viewBox="0 0 640 220" width="100%" id="dv-s"></svg><div class="afrow" id="dv-a"></div>`;
      let m = 0;
      const ctl = () => { q('#dv-ctl').innerHTML = m === 0 ? rng('dv-1', 'R1 (top)', 1000, 20000, 500, 10000) + rng('dv-2', 'R2 (bottom)', 1000, 20000, 500, 10000) : rng('dv-l', 'Light', 0, 100, 1, 40); [...el.querySelectorAll('#dv-ctl input')].forEach(x => x.oninput = draw); draw(); };
      const draw = () => {
        let r1, r2, n2, l2;
        if (m === 0) { r1 = +q('#dv-1').value; r2 = +q('#dv-2').value; q('#dv-1v').textContent = ohm(r1); q('#dv-2v').textContent = ohm(r2); n2 = ohm(r2); l2 = 'R2'; }
        else { const L = +q('#dv-l').value; r1 = 4700; r2 = 100000 * Math.pow(0.97, L); q('#dv-lv').textContent = L < 20 ? 'dark' : L > 80 ? 'bright' : 'room light'; n2 = ohm(r2); l2 = 'LDR'; }
        const vo = 5 * r2 / (r1 + r2), adc = Math.round(vo / 5 * 1023);
        q('#dv-s').innerHTML = `${D(250, 20, 'red')}${T(262, 24, '5 V', 'var(--red)', 9, 'start')}${W('M250 20 V40', 'red')}${res(250, 60, ohm(r1))}${T(300, 64, 'R1', 'var(--o1)', 8, 'start')}${W('M250 68 V110', 'peach')}${D(250, 110, 'peach', 4.5)}
          ${W('M250 110 H120', 'peach')}${box(30, 90, 90, 40, 6)}${T(75, 108, 'A0', 'var(--text)', 10)}${T(75, 121, 'analogRead', 'var(--o1)', 7)}
          ${W('M250 110 V142', 'peach')}${res(250, 150, n2)}${T(300, 154, l2, 'var(--o1)', 8, 'start')}${W('M250 158 V190', 'o0')}${D(250, 190, 'o0')}${T(262, 194, 'GND', 'var(--o1)', 9, 'start')}
          <rect x="400" y="30" width="30" height="160" rx="6" fill="var(--mantle)" stroke="${faint}"/><rect x="400" y="${190 - vo / 5 * 160}" width="30" height="${vo / 5 * 160}" rx="6" fill="var(--peach)"/>${T(415, 22, '5 V', 'var(--o1)', 8)}${T(415, 206, '0 V', 'var(--o1)', 8)}${T(440, 194 - vo / 5 * 160, vo.toFixed(2) + ' V', 'var(--text)', 11, 'start')}`;
        q('#dv-a').innerHTML = cell('Vout', '5 V x R2 / (R1 + R2)', vo.toFixed(2) + ' V') + cell('analogRead(A0)', 'Vout / 5 V x 1023', adc) + cell('Ratio', 'R2 share of the total', Math.round(r2 / (r1 + r2) * 100) + '%');
      };
      pick(q, '#dv-c', i => { m = i; ctl(); }); ctl();
    },

    // I2C LCD wiring: the backpack pins are drawn in the Arduino's order, so every wire is straight
    lcdwire(el) {
      const svg = `<svg viewBox="0 0 640 240" width="100%">
        ${box(30, 20, 150, 200, 12)}${T(105, 40, 'Arduino Uno', 'var(--text)', 10)}
        ${D(180, 80, 'red')}${T(172, 84, '5V', 'var(--text)', 8, 'end')}${D(180, 120, 'o0')}${T(172, 124, 'GND', 'var(--text)', 8, 'end')}${D(180, 160, 'mauve')}${T(172, 164, 'A4 (SDA)', 'var(--text)', 8, 'end')}${D(180, 200, 'blue')}${T(172, 204, 'A5 (SCL)', 'var(--text)', 8, 'end')}
        ${box(340, 20, 260, 200, 12, 'var(--mantle)')}${T(470, 40, '16x2 LCD with an I2C backpack', 'var(--text)', 10)}
        ${box(346, 56, 70, 160, 8, 'var(--crust)', faint)}${T(381, 70, 'backpack', 'var(--o1)', 7)}
        ${box(430, 60, 160, 90, 6, 'var(--crust)', faint)}${T(510, 96, 'Hello, world!', 'var(--green)', 14)}${T(510, 120, '16 columns x 2 rows', 'var(--o1)', 8)}
        ${T(510, 180, 'faint or blank text?', 'var(--o1)', 8)}${T(510, 194, 'turn the contrast screw on the backpack', 'var(--o1)', 8)}
        ${W('M180 80 H356', 'red')}${W('M180 120 H356', 'o0')}${W('M180 160 H356', 'mauve')}${W('M180 200 H356', 'blue')}
        ${D(356, 80, 'red')}${T(368, 84, 'VCC', 'var(--text)', 8, 'start')}${D(356, 120, 'o0')}${T(368, 124, 'GND', 'var(--text)', 8, 'start')}${D(356, 160, 'mauve')}${T(368, 164, 'SDA', 'var(--text)', 8, 'start')}${D(356, 200, 'blue')}${T(368, 204, 'SCL', 'var(--text)', 8, 'start')}
      </svg>`;
      el.innerHTML = `<p class="wgt">Wiring diagram: a 16x2 LCD with an I2C backpack</p>${svg}${legend([['red', '5V to VCC'], ['o0', 'GND to GND'], ['mauve', 'A4 to SDA (the data line)'], ['blue', 'A5 to SCL (the clock line)']])}<p class="wgcap">The pins are drawn in a row so the wires do not cross. On the real backpack the order is usually GND, VCC, SDA, SCL, so read the labels printed on yours.</p>`;
    },

    // HC-SR04 wiring only: straight wires to a sensor turned to face the board
    sonarwire(el) {
      el.innerHTML = `<p class="wgt">Wiring diagram: the HC-SR04</p>
        <svg viewBox="0 0 640 240" width="100%">
          ${box(30, 20, 150, 200, 12)}${T(105, 40, 'Arduino Uno', 'var(--text)', 10)}
          ${D(180, 80, 'red')}${T(172, 84, '5V', 'var(--text)', 8, 'end')}${D(180, 120, 'mauve')}${T(172, 124, 'pin 9', 'var(--text)', 8, 'end')}${D(180, 160, 'blue')}${T(172, 164, 'pin 10', 'var(--text)', 8, 'end')}${D(180, 200, 'o0')}${T(172, 204, 'GND', 'var(--text)', 8, 'end')}
          ${box(340, 20, 260, 200, 12, 'var(--mantle)')}${T(470, 40, 'HC-SR04', 'var(--text)', 10)}
          ${W('M180 80 H350', 'red')}${W('M180 120 H350', 'mauve')}${W('M180 160 H350', 'blue')}${W('M180 200 H350', 'o0')}
          ${D(350, 80, 'red')}${T(362, 84, 'VCC', 'var(--text)', 8, 'start')}${D(350, 120, 'mauve')}${T(362, 124, 'Trig', 'var(--text)', 8, 'start')}${D(350, 160, 'blue')}${T(362, 164, 'Echo', 'var(--text)', 8, 'start')}${D(350, 200, 'o0')}${T(362, 204, 'GND', 'var(--text)', 8, 'start')}
          <circle cx="446" cy="130" r="30" fill="var(--crust)" stroke="${edge}"/><circle cx="548" cy="130" r="30" fill="var(--crust)" stroke="${edge}"/>${T(446, 135, 'T', 'var(--o1)', 16)}${T(548, 135, 'R', 'var(--o1)', 16)}${T(446, 180, 'sends', 'var(--o1)', 8)}${T(548, 180, 'listens', 'var(--o1)', 8)}
        </svg>
        ${legend([['red', '5V to VCC'], ['mauve', 'pin 9 to Trig (we send a 10 microsecond pulse)'], ['blue', 'pin 10 from Echo (we time the pulse that comes back)'], ['o0', 'GND to GND']])}`;
    },

    // HC-SR04 timing, one animated diagram: the sound travels to the wall and back while a playhead sweeps the Trig and Echo traces
    sonartiming(el) {
      const q = s => el.querySelector(s);
      el.innerHTML = `<p class="wgt">Try it: how far is the wall?</p>
        <div class="tb">${rng('sn-d', 'Distance', 5, 200, 1, 50)}${bt('sn-play', 'Play', 'act')}</div>
        <div class="nndiag"><svg viewBox="0 0 580 256" width="100%" id="sn-s"></svg></div><div class="afrow" id="sn-a"></div>
        <p class="wgcap">The Trig pulse is really 10 µs, too narrow to see at this scale, so it is drawn wider. Press Play to watch one measurement.</p>`;
      const lab = (x, y, t, a = 'middle', c = 'var(--o1)', s = 10) => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${s}" fill="${c}">${t}</text>`;
      const arrow = (x1, x2, y, c) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="var(--${c})" stroke-width="1.5"/><polygon transform="translate(${x2} ${y})" points="${x2 > x1 ? '-5,-3.5 -5,3.5 1,0' : '5,-3.5 5,3.5 -1,0'}" fill="var(--${c})"/>`;
      const X0 = 80, W_ = 480, MAX = 12000, T1 = [124, 150], T2 = [184, 210], xs = us => X0 + us / MAX * W_;
      const st = { p: 1 }, cid = 'sn-clip' + Math.random().toString(36).slice(2, 7); let timer = null;
      const draw = () => {
        const d = +q('#sn-d').value, t = d * 2 / 0.0343, tau = st.p * MAX;                // tau: the time the playhead has reached, in microseconds
        const xw = 160 + (d - 5) / 195 * 380, x1 = 118, x2 = xw - 6;                       // where the wall is drawn, and the ends of the sound path
        const e0 = xs(200), e1 = e0 + t / MAX * W_, xp = xs(tau);
        q('#sn-dv').textContent = d + ' cm';
        // the sound burst: sits at the sensor, then goes out, then comes back
        const f = Math.min(1, Math.max(0, (tau - 200) / t)), out = f < 0.5, bx = out ? x1 + f * 2 * (x2 - x1) : x2 - (f - 0.5) * 2 * (x2 - x1), by = out ? 32 : 48;
        const flying = tau >= 0 && tau <= 200 + t && st.p < 1;
        let g = `<rect x="70" y="20" width="44" height="40" rx="8" fill="var(--base)" stroke="var(--sub0)" stroke-width="1.5"/>${lab(92, 44, 'sensor', 'middle', 'var(--text)', 10)}
          <rect x="${xw.toFixed(1)}" y="12" width="5" height="56" rx="2" fill="var(--o0)"/>${lab(xw + 2, 8, 'wall', 'middle', 'var(--o1)', 10)}
          ${arrow(x1, x2, 32, 'peach')}${arrow(x2, x1, 48, 'blue')}${lab((x1 + x2) / 2, 26, 'sound goes out', 'middle', 'var(--peach)', 9)}${lab((x1 + x2) / 2, 62, 'and comes back', 'middle', 'var(--blue)', 9)}
          <path d="M${x1} 78 V84 H${x2.toFixed(1)} V78" fill="none" stroke="var(--s1)"/>${lab(((x1 + x2) / 2).toFixed(1), 98, 'distance = ' + d + ' cm', 'middle', 'var(--text)', 10)}
          ${flying ? `<circle cx="${bx.toFixed(1)}" cy="${by}" r="9" fill="var(--${out ? 'peach' : 'blue'})" fill-opacity=".25"/><circle cx="${bx.toFixed(1)}" cy="${by}" r="4.5" fill="var(--${out ? 'peach' : 'blue'})"/>` : ''}`;
        // the grid, drawn once per frame so it stays under the traces
        for (let ms = 0; ms <= 12; ms += 2) g += `<line x1="${xs(ms * 1000)}" y1="114" x2="${xs(ms * 1000)}" y2="218" stroke="var(--s0)"/>${lab(xs(ms * 1000), 234, ms, 'middle', 'var(--o0)', 9)}`;
        [T1, T2].forEach(r => { g += `<line x1="${X0}" y1="${r[0]}" x2="${X0 + W_}" y2="${r[0]}" stroke="var(--s0)" stroke-dasharray="3 3"/><line x1="${X0}" y1="${r[1]}" x2="${X0 + W_}" y2="${r[1]}" stroke="var(--s1)"/>${lab(X0 - 8, r[0] + 3, 'HIGH', 'end', 'var(--o0)', 8)}${lab(X0 - 8, r[1] + 3, 'LOW', 'end', 'var(--o0)', 8)}`; });
        g += `${lab(8, 141, 'Trig', 'start', 'var(--mauve)')}${lab(8, 201, 'Echo', 'start', 'var(--blue)')}${lab(X0 + W_ / 2, 250, 'time (ms)', 'middle', 'var(--o1)', 9)}
          <clipPath id="${cid}"><rect x="${X0 - 2}" y="100" width="${(xp - X0 + 2).toFixed(1)}" height="130"/></clipPath>
          <g clip-path="url(#${cid})">
            <path d="M${X0} ${T1[1]} H${X0 + 6} V${T1[0]} H${X0 + 14} V${T1[1]} H${X0 + W_}" fill="none" stroke="var(--mauve)" stroke-width="2" stroke-linejoin="round"/>
            <path d="M${X0} ${T2[1]} H${e0.toFixed(1)} V${T2[0]} H${e1.toFixed(1)} V${T2[1]} H${X0 + W_}" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linejoin="round"/>
          </g>`;
        if (xp > X0 + 20) g += lab(X0 + 24, T1[0] + 4, '10 µs pulse', 'start', 'var(--mauve)', 9);
        if (xp >= e0) g += `<line x1="${e0.toFixed(1)}" y1="${T1[1]}" x2="${e0.toFixed(1)}" y2="${T2[0]}" stroke="var(--s1)" stroke-dasharray="2 3"/>${e1 - e0 > 220 ? lab((e0 + 6).toFixed(1), T1[1] + 14, '8 bursts have left', 'start', 'var(--peach)', 9) : ''}`;
        if (xp >= e1) g += `<line x1="${e1.toFixed(1)}" y1="${T1[1]}" x2="${e1.toFixed(1)}" y2="${T2[0]}" stroke="var(--s1)" stroke-dasharray="2 3"/>${e1 - e0 > 220 ? lab((e1 - 6).toFixed(1), T1[1] + 14, 'the echo is back', 'end', 'var(--blue)', 9) : ''}
          <path d="M${e0.toFixed(1)} ${T2[0] - 8} V${T2[0] - 12} H${e1.toFixed(1)} V${T2[0] - 8}" fill="none" stroke="var(--peach)"/>${lab(((e0 + e1) / 2).toFixed(1), T2[0] - 18, 'echo width = ' + Math.round(t) + ' µs', 'middle', 'var(--peach)', 10)}`;
        if (st.p < 1) g += `<line x1="${xp.toFixed(1)}" y1="106" x2="${xp.toFixed(1)}" y2="218" stroke="var(--mauve)" stroke-width="1.5"/>${lab((xp + 5).toFixed(1), 110, (tau / 1000).toFixed(1) + ' ms', 'start', 'var(--mauve)', 9)}`;
        q('#sn-s').innerHTML = g;
        q('#sn-a').innerHTML = cell('Echo pulse', 'time there and back', Math.round(t) + ' µs') + cell('Distance', 'time x 0.0343 / 2', d + ' cm') + cell('Why divide by 2', 'the sound goes there and back', 'x 0.5');
      };
      const stop = () => { if (timer) { clearInterval(timer); timer = null; } q('#sn-play').textContent = 'Replay'; };
      q('#sn-play').onclick = () => {
        if (timer) return stop();
        st.p = 0; const t0 = Date.now(), DUR = 3600;                                   // one measurement takes about 3.6 seconds to play
        q('#sn-play').textContent = 'Pause';
        timer = trackTimer(setInterval(() => { st.p = Math.min(1, (Date.now() - t0) / DUR); draw(); if (st.p >= 1) stop(); }, 16));
        draw();
      };
      q('#sn-d').oninput = () => { if (timer) { clearInterval(timer); timer = null; } st.p = 1; q('#sn-play').textContent = 'Play'; draw(); };
      draw();
    },

    // servo: pulse width and angle
    servowire(el) {
      const q = s => el.querySelector(s);
      el.innerHTML = `<p class="wgt">Wiring diagram and pulse: a servo motor</p>
        <svg viewBox="0 0 640 240" width="100%" id="sv-s"></svg>
        ${legend([['o0', 'brown or black: GND'], ['red', 'red: 5V'], ['peach', 'orange or yellow: signal, a PWM pin']])}
        <p class="wgcap">The wires are drawn in a row so they do not cross. On the real plug the order from one end is brown, red, orange.</p>
        <div class="tb">${rng('sv-a', 'myservo.write(', 0, 180, 5, 90)}</div><div class="afrow" id="sv-r"></div>`;
      const draw = () => {
        const a = +q('#sv-a').value, us = Math.round(544 + a * (2400 - 544) / 180), duty = us / 20000, rad = (a - 180) * Math.PI / 180, ax = 555 + 56 * Math.cos(rad), ay = 130 + 56 * Math.sin(rad);
        q('#sv-av').textContent = a + ')';
        q('#sv-s').innerHTML = `${box(30, 20, 150, 200, 12)}${T(105, 40, 'Arduino Uno', 'var(--text)', 10)}${D(180, 80, 'red')}${T(172, 84, '5V', 'var(--text)', 8, 'end')}${D(180, 130, 'peach')}${T(172, 134, 'pin 6 (~)', 'var(--text)', 8, 'end')}${D(180, 180, 'o0')}${T(172, 184, 'GND', 'var(--text)', 8, 'end')}
          ${box(330, 40, 130, 170, 10, 'var(--mantle)')}${T(395, 60, 'SG90 servo', 'var(--text)', 10)}
          ${W('M180 80 H340', 'red')}${W('M180 130 H340', 'peach')}${W('M180 180 H340', 'o0')}
          ${D(340, 80, 'red')}${T(352, 84, 'red: 5V', 'var(--text)', 8, 'start')}${D(340, 130, 'peach')}${T(352, 134, 'orange: signal', 'var(--text)', 8, 'start')}${D(340, 180, 'o0')}${T(352, 184, 'brown: GND', 'var(--text)', 8, 'start')}
          <circle cx="555" cy="130" r="64" fill="none" stroke="${faint}" stroke-dasharray="3 5"/><path d="M491 130 A64 64 0 0 1 619 130" fill="none" stroke="${faint}"/>${T(491, 150, '0°', 'var(--o1)', 8)}${T(619, 150, '180°', 'var(--o1)', 8)}${T(555, 56, '90°', 'var(--o1)', 8)}
          <line x1="555" y1="130" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="var(--peach)" stroke-width="5" stroke-linecap="round"/>${D(555, 130, 'text', 6)}`;
        q('#sv-r').innerHTML = cell('Pulse width', 'sent every 20 ms', us + ' µs') + cell('Duty', 'pulse / 20 ms', (duty * 100).toFixed(1) + '%') + cell('Angle', 'where the arm goes', a + '°');
      };
      q('#sv-a').oninput = draw; draw();
    },
  };
  window.moreWidgets = Object.assign(window.moreWidgets || {}, widgets);
})();
