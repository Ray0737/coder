---
title: LCD: wiring I2C
summary: Connect a 16x2 character screen with four wires, find its address and print text and numbers.
---

> [!aha] A plain LCD needs about sixteen wires. An LCD with an **I2C backpack** needs four, because a small chip on the back turns two data wires into everything the screen needs.

## What you need

| Part | Note |
|---|---|
| 16x2 LCD with an I2C backpack | 16 columns, 2 rows, with a small board soldered on the back |
| 4 jumper wires | female to male, if the screen has pins, or male to male through the breadboard |
| `LiquidCrystal_I2C` library | installed in the Library Manager (by Frank de Brabander) |

> [!more] TLDR: four wires, one library
> VCC, GND, SDA and SCL, and the library that knows how to talk to the screen.
>
> - VCC and GND are power. The backpack takes 5 V, so use the Uno's **5V** pin and not 3.3V, or the backlight is weak.
> - SDA and SCL are the two data wires, and they are what the backpack's chip uses to receive text.
> - The library hides all the signalling, so you only call `lcd.print`. Without it, the same screen would need you to toggle the pins by hand.

## The wiring

The backpack has four pins, and each goes to one place on the Uno. The two data wires must go to **A4 and A5**, which are the I2C pins of the Uno.

```widget
lcdwire
```

1. Unplug the USB cable.
2. Connect the backpack's **GND** to an Arduino **GND** pin.
3. Connect the backpack's **VCC** to the Arduino **5V** pin.
4. Connect the backpack's **SDA** to **A4**.
5. Connect the backpack's **SCL** to **A5**.
6. Plug in the USB cable. The backlight comes on, and the first row may show a row of solid blocks.

Blocks, or nothing, is normal until the code runs. If the backlight is on but the rows are empty or all blocks, turn the small blue **contrast screw** on the backpack, a little at a time, until the letters appear.

> [!more] TLDR: SDA to A4, SCL to A5
> Swapping the two data wires is the most common mistake. The screen shows nothing and nothing warns you.
>
> The Uno's I2C pins are fixed in the chip, so SDA must go to A4 and SCL to A5 (on newer Uno boards they are also marked next to AREF). A wire on any other pin will not work, however good the connection. If the screen stays blank, swap the two wires first: it costs ten seconds, and it is the cause far more often than a broken screen.

## Find the address

Every I2C device has an address. The usual backpacks are `0x27` or `0x3F`, and the wrong one shows nothing. Upload this scanner once to learn yours, and open the Serial Monitor at 9600.

```cpp
#include <Wire.h>

void setup() {
  Serial.begin(9600);
  Wire.begin();
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {      // 0 means a device answered
      Serial.print("Found device at 0x");
      Serial.println(addr, HEX);
    }
  }
}

void loop() { }
```

If it finds nothing, the wiring is wrong: check SDA and SCL, and the 5V and GND.

> [!more] TLDR: scan, do not guess
> The scanner answers "is anything on the two wires, and where?", which is the first question to ask when a screen is blank.
>
> It tries every address from 1 to 126 and prints the ones that answer, so a result of `0x27` means you can put `0x27` in `LiquidCrystal_I2C lcd(0x27, 16, 2)`. Two common results are `0x27` and `0x3F`. If it prints nothing at all, the problem is the wiring or the power, and changing the address in your sketch will not help.

## Write on the screen

```cpp
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);       // address, columns, rows

void setup() {
  lcd.init();                 // start the screen
  lcd.backlight();            // turn on the light
  lcd.setCursor(0, 0);        // column 0, row 0: top left
  lcd.print("Hello, world!");
  lcd.setCursor(0, 1);        // column 0, row 1: the second line
  lcd.print("Uptime: ");
}

void loop() {
  lcd.setCursor(8, 1);
  lcd.print(millis() / 1000); // seconds since the start
  lcd.print("   ");           // spaces wipe the old digits
}
```

`setCursor(column, row)` counts from 0, so the screen has columns 0 to 15 and rows 0 and 1. `lcd.clear()` blanks everything but takes a moment and flickers, so print spaces over the part you change, as above.

> [!more] TLDR: cursor, then print
> Place the cursor, then print. To change a number on screen, print spaces after it to hide the old digits.
>
> The screen keeps what you wrote until you overwrite it, so a shorter number leaves the tail of the old one behind: going from `100` to `9` shows `900` unless you print spaces. Prefer `setCursor` plus spaces to `lcd.clear()` inside `loop()`, because `clear()` is slow and makes the text flicker. Text past column 15 is simply not shown, so keep each line to 16 characters.

## Printing numbers

`lcd.print` can show whole numbers and decimals. The second argument gives the number of decimals.

```cpp
lcd.print(42);        // 42
lcd.print(3.14159, 2);// 3.14
lcd.print(lux, 0);    // no decimals, as in the lux meter
```

The tank-valve sketch (`valve.ino`) and the lux meter (`ldr.ino`) both use the screen to show the level, the valve state or the brightness.

> [!more] TLDR: the screen is the Serial Monitor you can carry
> When the Uno is away from the computer, the LCD is how a project reports what it is doing.
>
> Use it for the same things you would send to `Serial.println`: a sensor value, a state such as "valve open", or an error. Show a number with a fixed number of decimals (`lcd.print(x, 1)`) so it does not jump in width, and update it only when it changes or every few hundred milliseconds, since a screen refreshed non-stop is hard to read.

## If it does not work

| Symptom | Cause | Fix |
|---|---|---|
| backlight off | VCC or GND is loose | check the two power wires |
| backlight on, blank or blocks | contrast is wrong | turn the contrast screw |
| backlight on, still blank after the sketch | the wrong address, or the SDA and SCL wires swapped | run the scanner, and check A4 and A5 |
| the compile fails on `LiquidCrystal_I2C.h` | the library is not installed | install it in the Library Manager |
| garbage characters | a loose wire, or a long wire pair | push the jumpers in and use shorter wires |

> [!more] TLDR: contrast, address, wires
> Three things are wrong in nearly every blank LCD, and they are in that order of likelihood.
>
> 1. **Contrast.** Backlight on but no letters: turn the blue screw slowly, a quarter turn at a time, through its whole range.
> 2. **Address.** Run the scanner and copy the address it prints into your sketch.
> 3. **Wires.** Check SDA to A4 and SCL to A5, and push each jumper in firmly. A wire that looks seated but is loose is common on a breadboard.
>
> Change one thing at a time, and test after each, so you know which one fixed it.
