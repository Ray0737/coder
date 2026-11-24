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
