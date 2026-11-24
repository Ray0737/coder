---
title: LED: blink and active levels
summary: Wire an LED on a breadboard, blink it, fade it, and learn why some outputs turn on at LOW.
---

> [!aha] An output that is "on" is not always HIGH. How a part is wired decides whether it turns on at HIGH (active high) or at LOW (active low), and the code has to match the wiring.

## What you need

| Part | Quantity | Note |
|---|---|---|
| Arduino Uno and a USB cable | 1 | |
| Breadboard | 1 | |
| LED (any colour) | 1 to 4 | the long leg is the anode (+) |
| Resistor 220 Ω (red, red, brown) | one for each LED | |
| Jumper wires | 2 for each LED | |

> [!more] TLDR: one resistor per LED
> The resistor sits in series with the LED, and its job is to limit the current to about 14 mA.

## Wire one LED, active high

The pin pushes the current out. The LED turns on when the pin is HIGH.

1. Unplug the USB cable. Connect a jumper from an Arduino **GND** pin to the **- rail**.
2. Put the **LED** with its long leg in column 10 and its short leg in column 11 (rows `a`).
3. Put a **220 ohm resistor** with one leg in column 9, and the other leg in column 10 (rows `b`), so it meets the LED's long leg.
4. Jumper column 9 to the Arduino **pin 8**.
5. Jumper column 11 to the **- rail**.

The path: pin 8, the resistor, the LED from the long leg to the short leg, then GND.

```cpp
const int LED_PIN = 8;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);   // current flows, the LED is on
  delay(500);
  digitalWrite(LED_PIN, LOW);    // no push, the LED is off
  delay(500);
}
```

> [!more] TLDR: HIGH is on, LOW is off
> The pin is the supply. At HIGH it pushes current through the LED to GND.

## Active low: the opposite wiring

Now swap the roles. Connect the LED to **5V** and let the pin be the **return path** to ground. The current flows into the pin, so the LED lights when the pin is **LOW**, and goes out when it is HIGH. Switch the diagram, press the button, and compare.

```widget
ledwire
```

To build it, keep the same LED and resistor, but put the **long leg** towards 5V:

1. Jumper the **5V** pin to the **+ rail**, and the + rail to the resistor's first leg (column 9).
2. The resistor's other leg meets the LED's long leg (column 10), as before.
3. Jumper the LED's short leg (column 11) to the Arduino **pin 8**, not to GND.

```cpp
digitalWrite(8, LOW);    // the LED is on
digitalWrite(8, HIGH);   // the LED is off
```

> [!more] TLDR: where the pin sits decides the level
> Between the pin and GND it is active high. Between 5V and the pin it is active low.

## Why does active low exist?

Many driver boards, relay modules and chips have inputs that turn **on at LOW**, because of the way their inner parts are built. A relay board often does this. If you wire it and write HIGH expecting it to turn on, it stays off, and the first day it feels like a broken board. The course sketch `digital.ino` drives four outputs: pins 6 and 7 are active high and pins 8 and 9 are active low.

```cpp
digitalWrite(6, HIGH);   // active high: on
digitalWrite(7, HIGH);   // active high: on
digitalWrite(8, LOW);    // active low: on
digitalWrite(9, LOW);    // active low: on
```

A good habit is to write a name for it in the code:

```cpp
const int ON_ACTIVE_LOW = LOW;
const int OFF_ACTIVE_LOW = HIGH;
digitalWrite(8, ON_ACTIVE_LOW);
```

> [!more] TLDR: read the datasheet
> "Active high" or "active low" is written for the input of every module. Check it before you wire it, and then write the code to match.

## Fading with PWM

A digital pin can only be on or off, but with **PWM** (the `~` pins) the LED seems to go dim. Wire an LED to pin 9, 10 or 11 and use `analogWrite`.

```cpp
void loop() {
  for (int v = 0; v <= 255; v++) {      // get brighter
    analogWrite(9, v);
    delay(5);
  }
  for (int v = 255; v >= 0; v--) {      // get dimmer
    analogWrite(9, v);
    delay(5);
  }
}
```

The `fade.ino` sketch does this on three LEDs, on pins 9, 10 and 11, one after another.

> [!more] TLDR: fade needs a ~ pin
> A pin without the `~` only gives full on or full off. Use 3, 5, 6, 9, 10 or 11.

## If it does not work

| Symptom | Cause |
|---|---|
| never lights | LED turned round, a leg in the wrong column, or the wrong pin number in the sketch |
| very dim | resistor too large, or a PWM value near 0 |
| lit at the wrong time | it is wired active low and the code assumes active high |
| the board's own L LED blinks but yours does not | your LED is on another pin from the one in the code |

> [!more] TLDR: swap the LED first
> Turn the LED round and test again before anything else. It fails more often than any other part.
