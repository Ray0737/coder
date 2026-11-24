---
title: Series and parallel circuits
summary: Two ways to join parts, and what each one does to the current and the voltage.
---

> [!aha] Parts can be joined in a line or side by side. In a line, they share the same current and split the voltage. Side by side, they share the same voltage and split the current.

## In series: one road

Parts are in **series** when they are in one line, so the current has only one road and must pass through every part. The same current flows through all of them, and the supply voltage is shared between them. The resistances **add**: `R = R1 + R2`.

An LED and its resistor are in series. That is why the resistor controls the current in the LED, because the current in one is the current in the other.

```widget
seriesparallel
```

> [!more] TLDR: series adds resistance
> More parts in a line means more resistance and less current. If one part breaks, the road is cut and everything stops, like old Christmas lights.

## In parallel: more roads

Parts are in **parallel** when each one is connected across the same two points, so the current has a road for each. Each part gets the full supply voltage, and the currents **add**. Two equal resistors in parallel have half the resistance of one, because there are two roads.

```text
total resistance of two resistors in parallel:   R = (R1 x R2) / (R1 + R2)
```

The sockets in a house are in parallel, which is why one lamp can be off while another is on, and both get the same voltage.

> [!more] Math: why parallel is smaller
> Each road carries `V / R` of current, and the total is their sum, so the resistances combine as inverses:
>
> ```math
> 1 / R = 1 / R1 + 1 / R2          220 and 470 ohms:   1 / R = 0.00455 + 0.00213    so  R = 150 ohms
> ```
>
> The result is always smaller than the smallest resistor, because adding a road can only let more current through.

## What it means for LEDs

Two choices come up all the time in the course.

| Plan | What happens |
|---|---|
| 3 LEDs in series on 5 V | each red LED takes about 2 V, so three need 6 V and none lights |
| 2 LEDs in series on 5 V | 2 x 2 V = 4 V is used, 1 V is left for the resistor, so one 220 ohm resistor gives only about 4.5 mA, which is dim |
| 2 LEDs in parallel, one resistor each | each LED gets its own current and its own brightness. This is the right way |
| 2 LEDs in parallel, one shared resistor | works, but the LEDs steal current from each other, and the brightness changes if one is taken out |

So the rule is: **give every LED its own resistor**, each wired from a pin through the resistor and the LED to GND.

> [!more] TLDR: one resistor per LED
> Parallel branches with a resistor each are easy to understand and are the way the course wires four LEDs on pins 6 to 9.

## Where you meet them in Arduino projects

Everything on the breadboard's power rails is in parallel, because each part is joined across the same 5V and GND. A resistor and an LED, or a resistor and a sensor, are in series. A voltage divider, in the chapter after next, is just two resistors in series with a measurement in the middle.

> [!more] TLDR: rails are parallel, a chain is series
> If the same wire feeds many parts, they are in parallel. If a part sits one after another on the same wire, they are in series.
