---
title: Button: pull-up and pull-down
summary: Why a button needs a resistor, the two ways to wire it, and how to read it cleanly in code.
---

> [!aha] An input pin that is connected to nothing does not read LOW. It "floats" and reads random HIGH and LOW. A pull-up or pull-down resistor gives it a known value while the button is not pressed.

## The floating pin

If you wire a button between a pin and 5V, with nothing else, then when the button is **not** pressed the pin is connected to nothing at all. It picks up noise from your hand and the air, and `digitalRead` jumps between 0 and 1. The fix is a resistor that gently pulls the pin to a known level, so that the button only has to overpower it.

> [!more] TLDR: never leave an input open
> An input must always be connected to HIGH or LOW, either through the button or through a resistor.
>
> A floating pin can read 1 on one call and 0 on the next, and touching the wire with a finger changes it. The sketch looks right and the wiring looks right, so this bug is hard to see. If a button seems to press itself, or two runs give different results, suspect a floating pin first.

## Two ways to wire it

Try both. Press the button and watch what the pin reads.

```widget
buttonwire
```

| | Pull-up | Pull-down |
|---|---|---|
| The resistor goes to | 5V | GND |
| The button goes to | GND | 5V |
| Not pressed reads | HIGH | LOW |
| Pressed reads | LOW | HIGH |
| Resistor | inside the chip, `INPUT_PULLUP` | an external 10 kΩ |

The pull-up version is the easiest, because the Uno has the resistor built in (about 20 kΩ to 50 kΩ), so the button needs only **two wires**. The reading is upside down, though: pressed is LOW.

> [!more] TLDR: pull-up is the lazy one
> Use `INPUT_PULLUP` and a button to GND whenever you can. Use an external pull-down only when a part needs the signal to be HIGH when pressed.
>
> - Pull-up saves a resistor, a wire and a breadboard row, because the resistor is already in the chip.
> - Remember the reading is upside down: `LOW` means pressed. Write a comment next to the `if` so you do not forget.
> - The built-in pull-up is weak, about 20 kΩ to 50 kΩ, so keep the wire to the button short to avoid picking up noise.
> - Not every board has it on every pin, so check the pin if you move to another chip.

## Wire the pull-up button

You need a push button, a breadboard and two jumper wires.

1. Put the button across the middle gap, so its legs are in columns 12 and 14 (a button has four legs: two pairs are joined inside, and pressing joins the pairs together. If the pin reads pressed all the time, turn the button a quarter turn).
2. Jumper the button's one side to the Arduino **pin 2**.
3. Jumper the other side to the **- rail**, which is joined to GND.

```cpp
const int BUTTON_PIN = 2;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(BUTTON_PIN) == LOW) {     // LOW means pressed
    Serial.println("pressed");
  }
}
```

> [!more] TLDR: two wires and one word
> Button between the pin and GND, and `INPUT_PULLUP` in `setup()`.
>
> Forgetting the word `INPUT_PULLUP` and writing only `INPUT` is the usual mistake, and the pin then floats again. If the button reads the same whether you press it or not, check that one leg is on the pin and the other on GND, and that the button straddles the gap. A quarter turn of the button fixes the case where two legs are joined the wrong way.

## Wire the pull-down button

Here the button brings in 5 V, and a resistor holds the pin at 0 V the rest of the time. You need a button, a 10 kΩ resistor (brown, black, orange) and three jumper wires.

1. Put the button across the middle gap, in columns 12 and 14.
2. Jumper column 12 to the **+ rail** (5V).
3. Jumper column 14 to the Arduino **pin 3**.
4. Put the **10 kΩ resistor** from column 14 to the **- rail**, so it joins the pin to GND.

```cpp
pinMode(3, INPUT);                  // not INPUT_PULLUP: the resistor is outside
if (digitalRead(3) == HIGH) {       // HIGH means pressed
  Serial.println("pressed");
}
```

> [!more] TLDR: the resistor must be 10 k, not 220
> A small resistor would make a large current from 5V to GND when you press. 10 kΩ lets almost nothing through, and still holds the pin low.
>
> With 220 Ω, a press would draw 5 V / 220 Ω, about 23 mA, for as long as you hold the button, which is wasteful and can warm the resistor. With 10 kΩ it is 5 V / 10 kΩ, only 0.5 mA. Going much higher, such as 1 MΩ, makes the pin weak and noisy again. 4.7 kΩ to 47 kΩ all work, and 10 kΩ is the usual choice.

## Bounce

A real button does not close once. For a few thousandths of a second it makes and breaks contact, which a fast microcontroller reads as many presses. This is called **bounce**. A simple fix is to wait a short time after you see a press.

```cpp
int count = 0;
bool last = HIGH;

void loop() {
  bool now = digitalRead(2);
  if (last == HIGH && now == LOW) {      // the moment of the press
    count++;
    Serial.println(count);
    delay(50);                           // ignore the bounce
  }
  last = now;
}
```

Comparing with the **last** reading counts one press once, even when you hold the button, and `delay(50)` hides the bounce.

> [!more] TLDR: count the change, not the level
> Check for "was HIGH, now LOW", and wait about 50 ms. Otherwise one press counts as many.
>
> Bounce lasts roughly 1 ms to 20 ms, so 50 ms is a safe wait for most buttons. Without the `last` variable, holding the button counts again on every pass of `loop()`, which is thousands of times a second. The `delay(50)` is simple but it freezes the sketch, so for a program that must do other things at the same time, compare `millis()` instead.

## A binary counter

The course sketch `binary.ino` uses both buttons: pin 2 as a pull-up and pin 3 as a pull-down, and either one adds 1 to a counter. Four LEDs on pins 8 to 11 show the count in binary, so 5 is `0101`. It is a good check that you can read both wirings in the same program.

```cpp
for (int i = 0; i < 4; i++) {
  digitalWrite(8 + i, (count >> i) & 1);    // bit i of the count to LED i
}
```

> [!more] TLDR: one bit per LED
> `count >> i` moves bit `i` to the right place, and `& 1` keeps only that bit.
>
> For `count = 5`, which is `0101`: `i = 0` gives 1, `i = 1` gives 0, `i = 2` gives 1 and `i = 3` gives 0, so LEDs on pins 8 and 10 are on. Four LEDs can show 0 to 15, and the count wraps back to 0 after that, unless you reset it. Each LED needs its own 220 Ω resistor, because they are joined to different pins.
