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

## Current: the flow

**Current** (symbol `I`, unit the **ampere**, or amp, `A`) is how much charge passes a point each second, like the litres of water per second. The currents in this course are small, so we use the **milliampere**: 1 mA is 0.001 A. A small LED lights with about 10 to 20 mA.

An Arduino pin can give only about **20 mA** safely, and the absolute limit is 40 mA. A bigger load, such as a motor, must take its power from somewhere else, and the Arduino only switches it.

> [!more] TLDR: pins are for signals, not for power
> Use a pin for an LED or a signal. Never connect a motor or a heater directly to a pin.

## Resistance: the narrow pipe

**Resistance** (symbol `R`, unit the **ohm**, written `Ω`) is how much a part holds the current back. A resistor is a part made to hold it back by a known amount, so it is the way to choose how much current flows. A thin wire has little resistance and a resistor has a lot. Large values use a short form: `1kΩ` is 1000 ohms and `1MΩ` is a million.

Resistors have no printed numbers, so the value is written in coloured **bands**. The first two bands are digits and the third is the number of zeros.

| Value | Bands |
|---|---|
| 220 Ω | red, red, brown |
| 1 kΩ | brown, black, red |
| 4.7 kΩ | yellow, violet, red |
| 10 kΩ | brown, black, orange |

> [!more] TLDR: reading a resistor
> Two digits and a number of zeros: red red brown is 2, 2 and one zero, so 220. A resistor has no polarity, so it can go in either way round.

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

## A short circuit

If the pipe has no narrowing at all, the water rushes through. A **short circuit** is a path from the supply to ground with almost no resistance, such as a wire between 5V and GND. By `I = V / R` the current becomes huge, the wire or the battery gets hot, and the board can be damaged.

> [!warn] Never connect 5V straight to GND, and never leave a loose wire where it can touch both. When you build a circuit, unplug the USB cable first and plug it in last.

> [!more] TLDR: check before you power up
> Follow each wire with a finger from the supply to the ground, and make sure there is a resistor or a part on the way.
