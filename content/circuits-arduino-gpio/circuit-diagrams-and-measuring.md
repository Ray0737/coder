---
title: Circuit diagrams and measuring
summary: How to read a schematic, and how to check a circuit with a multimeter without breaking it.
---

> [!aha] A circuit diagram is a map. It does not show what the parts look like, only how they are joined, so any wiring you can read on the map can be built on a breadboard.

## The symbols

A **schematic** draws every part as a small symbol and every wire as a line. The shape on the page does not match the real layout, only the connections matter. These are the symbols used in this course.

| Part | Symbol | Notes |
|---|---|---|
| Resistor | a small rectangle (or a zigzag) | no polarity, so either way round |
| LED | a triangle pointing at a bar, with two small arrows | the triangle points the way the current flows, the bar is the cathode (-) |
| Switch or button | a gap in the wire with a bar over it | closed when pressed |
| Battery or supply | two lines, the long one is + | or a label such as 5V |
| Ground (GND) | three short lines, one above the other | the 0 V point |
| Dots | a dot where wires cross | a dot means joined, no dot means they cross without touching |

Current is drawn flowing from the **+** side, around the loop, to the **-** side. This is called **conventional current**. The electrons really go the other way, but the maths and every diagram use the convention.

> [!more] TLDR: connections, not looks
> Read a schematic by following the wires: from a pin, through the parts, to GND. A dot is a join and a bare crossing is not.

## Read one

Here is the first circuit of the course, in words, the way a schematic shows it.

```text
5V pin  ->  resistor 220 ohm  ->  LED anode (+)
LED cathode (-)  ->  GND
```

This is a loop: it starts at the supply and returns to the ground. Current flows only when the loop is closed. If any wire is broken, the whole loop stops.

> [!more] TLDR: a circuit is a closed loop
> Current needs a way back. When a circuit does nothing, look for a broken loop first, and then for a short.

## The multimeter

A **multimeter** measures voltage, current and resistance. It has a dial for the quantity, two **probes** (red and black) and sockets to plug them in. The black probe goes into the socket marked **COM**, and the red one goes into the socket for what you measure. How you connect it depends on the quantity, so choose below.

```widget
multimeter
```

> [!warn] Only use the current setting with the meter in the line of the circuit. If you leave the dial on current and touch the probes across a part or a supply, the meter makes a short circuit, and it can blow its fuse.

> [!more] TLDR: the three rules
> Voltage is measured across the part, current is measured through the line and resistance is measured with the power off and the part out of the circuit.

## Useful checks

A few tests find most mistakes before the code is even run.

| Test | How | What it tells you |
|---|---|---|
| Continuity | dial on the beep or diode symbol, touch both ends of a wire | a beep means the wire is joined and is not broken |
| Supply | dial on DC volts (V with a straight line), red probe on 5V, black on GND | should read about 5 V |
| A resistor | out of the circuit, dial on ohms | should be close to its coloured bands, within about 5% |
| A pin | red probe on the pin, black on GND, while the sketch runs | about 5 V when HIGH and about 0 V when LOW |

> [!more] TLDR: measure before you guess
> A meter turns "it does not work" into a number. Check the supply first, then the pin, then the part.
