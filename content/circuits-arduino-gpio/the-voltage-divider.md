---
title: The voltage divider
summary: How two resistors turn a changing resistance, such as a light sensor, into a voltage the Arduino can read.
---

> [!aha] The Arduino can only read a voltage, but many sensors change their **resistance**. A voltage divider is the small circuit that turns one into the other.

## Two resistors, one measurement

Put two resistors in series between 5V and GND. The voltage at the point between them is a share of the 5 V, and the share depends on the two values. Connect that middle point to an analog pin, such as A0, and the Arduino measures it.

```text
5V --- R1 ---+--- R2 --- GND
             |
             +---> A0
```

Change a resistor, or let a sensor change it, and the voltage at A0 changes. Move the sliders, and then switch to the light sensor.

```widget
divider
```

> [!more] Math: the divider formula
> The same current flows through both resistors, so the voltage splits in the ratio of their sizes:
>
> ```math
> Vout = Vin * R2 / (R1 + R2)          analogRead = Vout / 5 * 1023
> ```
>
> With `R1 = R2` the output is exactly half, 2.5 V, which reads about 512. If R2 is larger than R1, the output is more than half.

> [!more] TLDR: the bottom resistor sets the share
> The output is the bottom resistor's share of the total. A big bottom resistor gives a high voltage, and a small one gives a low voltage.
>
> - R2 equal to R1 gives 2.5 V. R2 three times R1 gives 3.75 V, and R2 a third of R1 gives 1.25 V.
> - Only the ratio sets the voltage, so 1 kΩ with 1 kΩ and 100 kΩ with 100 kΩ both give 2.5 V.
> - Bigger values waste less current from the supply, but the Arduino's analog input prefers a divider whose resistance is below about 10 kΩ, so the middle range of 1 kΩ to 10 kΩ is a good start.

## The light sensor (LDR)

An **LDR** (light dependent resistor) is a resistor whose value falls when light falls on it: it is about 100 kΩ or more in the dark and a few kΩ in bright light. It has no polarity. As R2 in a divider, it turns light into a voltage.

| Light | LDR resistance | Voltage at A0 (R1 = 4.7 kΩ) |
|---|---|---|
| dark | large | high, close to 5 V |
| bright | small | low |

So with the LDR on the **bottom** of the divider, **more light means a lower voltage**. If you swap the two parts, it is the other way round.

> [!more] TLDR: the order decides the direction
> LDR to GND and a fixed resistor to 5V: dark gives high voltage. Swap them and dark gives low voltage. Write down which you built.
>
> With 4.7 kΩ on top and an LDR of 100 kΩ in the dark, A0 sees about 4.8 V. With the LDR at 2 kΩ in bright light, it sees about 1.5 V. If you would rather have "more light, bigger number", swap the parts or use `1023 - analogRead(A0)` in code. For the widest swing, pick a fixed resistor close to the LDR's value at the light level you care about.

## Wiring it

You need an LDR, a 4.7 kΩ resistor (yellow, violet, red), a breadboard and three jumper wires.

1. Unplug the USB cable, and run the **5V** pin and a **GND** pin to the + and - rails.
2. Place the 4.7 kΩ resistor with one leg in column 10 and the other in column 14.
3. Place the LDR with one leg in column 14 (the same column as the resistor's second leg) and the other in column 18.
4. Jumper the **+ rail** to column 10, so the resistor is joined to 5V.
5. Jumper column 18 to the **- rail**, so the LDR is joined to GND.
6. Jumper **column 14**, the middle point, to the Arduino pin **A0**.

The middle point, where the resistor and the LDR meet, is the only one that goes to A0.

> [!more] TLDR: the middle goes to the pin
> 5V to the resistor, the resistor to the LDR, the LDR to GND, and a wire from where the two meet to A0.
>
> The A0 wire must go to the shared column (column 14 above), not to one of the two outer ends. A common mistake is putting it on the 5V or GND side, which makes `analogRead` stick at 1023 or 0 whatever the light does. If the resistor and the LDR are in different columns, they are not joined, and the reading wanders at random.

## Reading it and finding the resistance

```cpp
const int LDR_PIN = A0;
const float R_REF = 4700.0;       // the fixed resistor, in ohms

void setup() {
  Serial.begin(9600);
}

void loop() {
  int raw = analogRead(LDR_PIN);
  float vout = raw * 5.0 / 1023.0;
  float r_ldr = R_REF * vout / (5.0 - vout);   // rearranged divider, LDR at the bottom
  Serial.print(raw);
  Serial.print("  ");
  Serial.println(r_ldr);
  delay(500);
}
```

Cover the LDR with your hand and `raw` rises. Hold a torch near it and `raw` falls.

> [!more] Math: the resistance from the reading
> Solve the divider formula for R2, the LDR at the bottom:
>
> ```math
> R2 = R1 * Vout / (Vin - Vout)          Vout = 2.5 V:   R2 = 4700 * 2.5 / 2.5 = 4700 ohms
> ```

## A warning about the lux sketch

The course's `ldr.ino` converts the reading to **lux** (units of light) on the LCD, with the wiring above. Its line `R = Rref * (5.0 / Vout - 1.0)` is the formula for the resistor at the **top**, so with the LDR at the bottom the number comes out upside down: the display would rise in the dark. Use `R = Rref * Vout / (5.0 - Vout)` as above, or swap the LDR and the resistor on the breadboard. The lux value is also only an estimate, because it uses typical numbers for a common LDR and not your exact part.

> [!more] TLDR: test the direction first
> Look at the raw number in the Serial Monitor before trusting any converted number. If it moves the wrong way, the wiring and the formula disagree.
>
> 1. Cover the LDR with your hand: with the wiring above, `raw` should go up.
> 2. Shine a torch on it: `raw` should go down.
> 3. If `raw` is stuck at 0 or 1023, the wiring is wrong, so fix it before you touch the formula.
>
> Only when the raw number behaves should you trust the resistance or lux value built from it.
