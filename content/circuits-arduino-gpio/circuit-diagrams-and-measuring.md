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
>
> - Start at the supply or the output pin, and end at GND, and name each part you pass.
> - The LED triangle points the way the current flows, from anode (+) to cathode (-), and the bar is the cathode.
> - A resistor and a button have no direction, but an LED does, so a backwards LED is a common reading mistake.
> - The same part may be drawn at different places on the page, and the wires may bend, but the connections stay the same.

## Read one

Here is the first circuit of the course, in words, the way a schematic shows it.

```text
5V pin  ->  resistor 220 ohm  ->  LED anode (+)
LED cathode (-)  ->  GND
```

This is a loop: it starts at the supply and returns to the ground. Current flows only when the loop is closed. If any wire is broken, the whole loop stops.

> [!more] TLDR: a circuit is a closed loop
> Current needs a way back. When a circuit does nothing, look for a broken loop first, and then for a short.
>
> A broken loop means no current: a wire is out, a leg is in the wrong column, or the GND jumper is missing. A short is the opposite, where current takes a path with almost no resistance, and the part gets hot or the board resets. Walk the loop with a finger from the pin to GND, and check each join, and the break is usually found in a minute. A switch is just a part of the loop that opens and closes it.

## The multimeter

A **multimeter** measures voltage, current and resistance. It has a dial for the quantity, two **probes** (red and black) and sockets to plug them in. The black probe goes into the socket marked **COM**, and the red one goes into the socket for what you measure. How you connect it depends on the quantity, so choose below.

```widget
multimeter
```

> [!warn] Only use the current setting with the meter in the line of the circuit. If you leave the dial on current and touch the probes across a part or a supply, the meter makes a short circuit, and it can blow its fuse.

> [!more] TLDR: the three rules
> Voltage is measured across the part, current is measured through the line and resistance is measured with the power off and the part out of the circuit.
>
> - Voltage: probes touch both sides of the part, and the circuit stays as it is. Dial on DC volts.
> - Current: the meter is part of the loop, so break the line and put the meter in the gap. Dial on amps, and red probe in the amps socket.
> - Resistance: power off, and lift one leg of the part, or other parts in parallel add to the reading.
> - After a current test, move the dial and the red probe back to volts, or the next test can short the supply and blow the fuse.

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
>
> A supply that reads 0 V or about 3 V points to a loose jumper or a weak USB port, and not to the part. A pin that stays at 0 V while the sketch says HIGH means the wrong pin number or a sketch that was not uploaded. A part with the right voltage across it and no light is probably faulty or turned round. Working from the supply towards the part finds the first place where the number goes wrong.
