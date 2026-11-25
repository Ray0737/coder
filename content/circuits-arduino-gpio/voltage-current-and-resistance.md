---
title: Voltage, current and resistance
summary: The three ideas behind every circuit, Ohm's law, and how to pick the resistor for an LED.
---

> [!aha] Think of water in a pipe. **Voltage** is how hard it is pushed, **current** is how much flows, and **resistance** is how narrow the pipe is. Change any one, and the other two react.

## Voltage: the push

**Voltage** (symbol `V`, unit the **volt**) is the push that moves electric charge, like the pressure of the water. A battery makes the push, and a circuit has to use it. Voltage always compares **two points**, so it is measured between them, and one of the two is usually the ground (GND), the point we call 0 V.

| Source | Voltage |
|---|---|
| a coin cell | 3 V |
| an AA battery | 1.5 V |
| the USB port, and the Arduino's 5V pin | 5 V |
| an Arduino pin set to HIGH | 5 V |
| an Arduino pin set to LOW | 0 V |

> [!more] TLDR: voltage is between two points
> A voltage is never "at" one place alone. When we say a pin is at 5 V, we mean 5 V higher than GND.
>
> - The voltage across a part is the difference between its two ends. An LED with 5 V on one leg and 3 V on the other has 2 V across it.
> - Two separate supplies can only be compared when their GNDs are joined, which is why a shared GND appears so often in this course.
> - A multimeter measures voltage with two probes for the same reason: it needs two points.

## Current: the flow

**Current** (symbol `I`, unit the **ampere**, or amp, `A`) is how much charge passes a point each second, like the litres of water per second. The currents in this course are small, so we use the **milliampere**: 1 mA is 0.001 A. A small LED lights with about 10 to 20 mA.

An Arduino pin can give only about **20 mA** safely, and the absolute limit is 40 mA. A bigger load, such as a motor, must take its power from somewhere else, and the Arduino only switches it.

> [!more] TLDR: pins are for signals, not for power
> Use a pin for an LED or a signal. Never connect a motor or a heater directly to a pin.
>
> The safe figure is about 20 mA for one pin, and the chip as a whole can give only about 200 mA across all its pins together. A small motor needs 100 to 500 mA, so it is far too much. The usual answer is to let the pin switch a transistor or a relay, and to let a separate supply provide the power.

## Resistance: the narrow pipe

**Resistance** (symbol `R`, unit the **ohm**, written `Ω`) is how much a part holds the current back. A resistor is a part made to hold it back by a known amount, so it is the way to choose how much current flows. A thin wire has little resistance and a resistor has a lot. Large values use a short form: `1kΩ` is 1000 ohms and `1MΩ` is a million.

Resistors have no printed numbers, so the value is written in coloured **bands**. The first two bands are digits and the third is the number of zeros.

### The colour code

Each colour stands for a number. The same colour means a **digit** in the first bands, a **multiplier** (how many zeros) in the band after them, and a **tolerance** (how far off the real value may be) in the last band.

| Colour | Digit | Multiplier | Tolerance |
|---|---|---|---|
| {#000000} black | 0 | x1 | |
| {#8b4513} brown | 1 | x10 | ±1% |
| {#e53935} red | 2 | x100 | ±2% |
| {#fb8c00} orange | 3 | x1 000 (1k) | |
| {#fdd835} yellow | 4 | x10 000 (10k) | |
| {#43a047} green | 5 | x100 000 (100k) | ±0.5% |
| {#1e88e5} blue | 6 | x1 000 000 (1M) | ±0.25% |
| {#8e24aa} violet | 7 | x10 000 000 (10M) | ±0.1% |
| {#9e9e9e} grey | 8 | | ±0.05% |
| {#ffffff} white | 9 | | |
| {#d4af37} gold | | x0.1 | ±5% |
| {#c0c0c0} silver | | x0.01 | ±10% |

To remember the order of 0 to 9: black and brown come first, then the rainbow from red to violet, then grey and white.

### How to read one

1. **Find the end.** Turn the resistor so the gold or silver band is on the **right**. That band is the tolerance, and it often sits a little apart from the others.
2. **Count the bands.** With 4 bands, the first **two** are digits. With 5 bands (precision resistors, often with a blue body), the first **three** are digits.
3. **Read the digits** left to right from the table.
4. **Read the multiplier**, the band just before the tolerance, and add that many zeros.
5. **Shorten it**: 4700 ohms is 4.7 kΩ, and 10 000 ohms is 10 kΩ.

| Value | 4 bands | 5 bands |
|---|---|---|
| 220 Ω | {#e53935} {#e53935} {#8b4513} {#d4af37} red, red, brown, gold | {#e53935} {#e53935} {#000000} {#000000} {#8b4513} red, red, black, black, brown |
| 1 kΩ | {#8b4513} {#000000} {#e53935} {#d4af37} brown, black, red, gold | {#8b4513} {#000000} {#000000} {#8b4513} {#8b4513} brown, black, black, brown, brown |
| 4.7 kΩ | {#fdd835} {#8e24aa} {#e53935} {#d4af37} yellow, violet, red, gold | {#fdd835} {#8e24aa} {#000000} {#8b4513} {#8b4513} yellow, violet, black, brown, brown |
| 10 kΩ | {#8b4513} {#000000} {#fb8c00} {#d4af37} brown, black, orange, gold | {#8b4513} {#000000} {#000000} {#e53935} {#8b4513} brown, black, black, red, brown |

Worked example: **yellow, violet, red, gold**. Yellow is 4 and violet is 7, so the digits are 47. Red is the multiplier x100, so 47 x 100 = 4700 ohms, or 4.7 kΩ. Gold means ±5%, so the real value is between about 4465 and 4935 ohms.

> [!more] TLDR: reading a resistor
> Two digits and a number of zeros: red red brown is 2, 2 and one zero, so 220. A resistor has no polarity, so it can go in either way round.
>
> - Gold or silver on the right, then read from the left. Read it backwards and 220 Ω (red red brown gold) turns into nonsense.
> - The usual mistake is between brown, red and orange, which look alike under a dim lamp. 220 Ω, 2.2 kΩ and 22 kΩ differ only in that third band.
> - If you are unsure, measure it with a multimeter on the ohms setting, with the resistor out of the circuit.

## Ohm's law

The three ideas are tied by one equation, found by Georg Ohm: **`V = I x R`**. Move the sliders. More voltage with the same resistor gives more current. A bigger resistor with the same voltage gives less.

```widget
ohmslaw
```

> [!more] Math: the three forms, and power
> Rearranged, the same law gives whichever one you do not know:
>
> ```math
> V = I * R          I = V / R          R = V / I
> ```
>
> The power a part turns into heat is `P = V * I`, in watts. A 220 ohm resistor on 5 V carries `5 / 220 = 22.7 mA` and turns `5 * 0.0227 = 114 mW` into heat. A normal resistor is rated for 250 mW (1/4 watt), so it is safe, but a smaller one would get hot.

## Choosing the resistor for an LED

An LED has almost no resistance once it is on, so on its own it would take too much current and burn out. The resistor in series with it chooses the current. The LED itself takes a fixed voltage, called its **forward voltage**, about 2 V for a red LED, so the resistor gets the rest.

```python
supply = 5.0           # volts, from the Arduino pin
led_drop = 2.0         # forward voltage of a red LED
current = 0.015        # we want 15 mA
r = (supply - led_drop) / current
print(r)               # 200 ohms, so use the next common value: 220
```

With 220 ohms the current is `(5 - 2) / 220 = 13.6 mA`, which is bright and safe. When you do not know the LED, 220 ohms to 1 kΩ is a safe choice, and the bigger the value, the dimmer the LED.

> [!more] TLDR: always a resistor with an LED
> Without it, the LED takes too much current and burns out, and it can damage the Arduino pin too. 220 ohms is the usual value in this course.
>
> - 220 ohms gives about 14 mA, and 1 kΩ gives about 3 mA, which is dim but still easy to see.
> - A value that is too small is also a mistake: 100 ohms would give 30 mA, more than the 20 mA a pin can safely supply.
> - Rule of thumb: when you do not know the LED, start with 220 ohms and go higher if it is too bright.

## A short circuit

If the pipe has no narrowing at all, the water rushes through. A **short circuit** is a path from the supply to ground with almost no resistance, such as a wire between 5V and GND. By `I = V / R` the current becomes huge, the wire or the battery gets hot, and the board can be damaged.

> [!warn] Never connect 5V straight to GND, and never leave a loose wire where it can touch both. When you build a circuit, unplug the USB cable first and plug it in last.

> [!more] TLDR: check before you power up
> Follow each wire with a finger from the supply to the ground, and make sure there is a resistor or a part on the way.
>
> 1. Name every part on each path from 5V to GND. If you find a path with none, that is a short circuit.
> 2. Look for loose legs or wires that could touch a neighbouring column or rail.
> 3. Plug in the USB cable last, and unplug it first before you change anything.
>
> If a part gets warm, you smell something hot, or the USB connection keeps dropping out, unplug the cable straight away and look for a short before you try again.
