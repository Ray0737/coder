---
title: Breadboard basics
summary: How a solderless breadboard is joined inside, and how to build a first circuit on one without a mistake.
---

> [!aha] A breadboard is a board of tiny spring clips, joined under the plastic in a fixed pattern. If you know which holes are joined, you can build any circuit with no solder.

## What is joined inside

Click a hole and see what is connected to it. The holes in the middle area are joined in **short columns of five**, and the two long strips at the top and bottom (the **rails**) are joined along their full length.

```widget
breadboard
```

| Area | What is joined |
|---|---|
| The middle, holes a to e of one column | all five, one connection |
| The middle, holes f to j of the same column | all five, a second connection |
| Between a to e and f to j | nothing: the gap in the middle separates them |
| A power rail (the + or - strip) | every hole along the whole strip |

The gap in the middle is the width of a chip, so that a chip can sit across it and each leg gets its own column.

> [!warn] Some larger boards have rails that are cut in the middle, so the left half and the right half are not joined. If a part at one end gets no power, run a short jumper across the break, or check with a meter.

> [!more] TLDR: five in a column, a long strip for power
> Parts in the same column half are joined, so put them there on purpose. A part in the same column on both legs is shorted out.

## Powering the rails

Use the rails as your 5 V and GND for the whole board, so that every part can reach them.

1. Unplug the USB cable.
2. Connect a **red** jumper from the Arduino **5V** pin to the **+** rail.
3. Connect a **black** jumper from an Arduino **GND** pin to the **-** rail.
4. If you use the second pair of rails at the bottom, link them to the top ones the same way, or take 5V and GND to them from the Arduino directly.

Colours are only a habit, but a habit that saves time: **red for 5V, black for GND**, and any other colour for signals. When every circuit follows it, a mistake is easy to spot.

> [!more] TLDR: red plus, black minus
> The rails become your 5V and GND. Every part then needs only one short wire to reach power.

## Placing the parts

| Part | How to place it |
|---|---|
| Resistor | either way round, with its legs bent at right angles and pushed into two different columns |
| LED | **long leg is the anode (+)**, which goes towards the supply. The short leg and the flat side of the plastic are the cathode (-) |
| Push button | straddle the middle gap, so the legs are in different columns. A pressed button joins the two sides. If it seems pressed all the time, turn it a quarter turn |
| Jumper wire | push in 5 mm to 8 mm of bare metal, and pull to check that it holds |

An LED has a polarity, so the wrong way round it does not light. It will not break at 5 V with a resistor, so if it fails to light, turn it round first.

> [!more] TLDR: LED long leg to plus
> Everything else is easy to place. The LED and the button are the two parts that need thinking about direction.

## A first circuit

Build this before anything else. It needs an LED, a 220 ohm resistor, a breadboard and two jumper wires.

1. Place the LED with its **long leg** in column 10, row `a`, and its short leg in column 11, row `a`.
2. Place the resistor with one leg in column 9, row `a`, and the other leg in column 10, row `b`. Its second leg shares column 10 with the LED's long leg, so the two are joined.
3. Run a jumper from column 9, row `c` (the same column as the resistor's first leg) to the Arduino **pin 8**.
4. Run a jumper from column 11, row `b` (the same column as the LED's short leg) to the **- rail**, which is connected to GND.
5. Check each wire against the list, then plug in the USB cable.

The path is: **pin 8, the jumper, the resistor, the LED (long leg to short leg), the jumper, GND**. A sketch that does `digitalWrite(8, HIGH)` lights it.

> [!more] TLDR: write the path down
> Before you power up, say the path out loud from the pin to GND. If you cannot, one part is in the wrong column.

## Common mistakes

| Symptom | Cause |
|---|---|
| nothing lights | a leg in the wrong column, an LED turned round, or the GND jumper missing |
| the LED is very dim | the wrong resistor, such as 100 kΩ instead of 220 Ω |
| a part is hot | a short circuit: unplug the USB cable at once |
| works, then stops | a loose jumper: push it in again and pull gently |

> [!more] TLDR: unplug before you change anything
> Change the wiring only with the USB cable out, and plug it in last.
