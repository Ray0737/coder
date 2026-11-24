---
title: Arduino IDE and the sketch
summary: Install the IDE, upload a first sketch, and read what setup() and loop() mean.
---

> [!aha] A sketch is an Arduino program, and it always has the same two parts: `setup()` runs once when the power comes on, and `loop()` runs again and again for as long as the board has power.

## Install and connect

The **Arduino IDE** is the free program where you write sketches, check them and send them to the board. Download it from the Arduino website (version 2.x is the current one) and install it.

1. Plug the Arduino into the computer with the USB cable. A light on the board comes on.
2. Open the IDE and choose **Tools**, then **Board**, then **Arduino AVR Boards**, then **Arduino Uno**.
3. Choose **Tools**, then **Port**, and pick the port that appears when the board is plugged in (`COM3` and so on on Windows, a name with `usbmodem` on macOS).
4. If no port appears, try another cable, because some USB cables only charge and carry no data.

> [!more] TLDR: board, port, upload
> Two menu choices (the board and the port) decide whether the upload works. Most "upload failed" errors are one of them.

## The first sketch: Blink

Open **File**, **Examples**, **01.Basics**, **Blink**. It makes the small LED on the board flash. This is the whole program.

```cpp
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);    // LED_BUILTIN is pin 13 on the Uno
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH); // LED on
  delay(1000);                     // wait 1000 milliseconds
  digitalWrite(LED_BUILTIN, LOW);  // LED off
  delay(1000);
}
```

Click the **Upload** button (the arrow). The board's LED flashes, once a second. You changed what the chip does without touching any wire, and that is the idea of the whole course.

> [!more] TLDR: setup once, loop forever
> `setup()` is for settings and runs one time. `loop()` is the work, and when it reaches the end it starts again from the top.

## The parts of a sketch

| Part | What it is |
|---|---|
| `void setup() { }` | runs once at the start: set pin modes, start the serial port, start the LCD |
| `void loop() { }` | runs forever, many thousands of times a second |
| `pinMode(pin, mode)` | says if a pin is an `OUTPUT`, an `INPUT` or an `INPUT_PULLUP` |
| `digitalWrite(pin, level)` | sets a pin `HIGH` or `LOW` |
| `delay(ms)` | stops the program for that many milliseconds |
| `// text` | a comment: the computer ignores it |
| `;` | ends every statement, and a missing one is the most common mistake |

Give pins names so the code explains itself. A name is easier to read than a number, and you change a pin in one place only.

```cpp
const int LED_PIN = 8;        // a constant: it never changes
#define BUTTON_PIN 2          // the older way, with no semicolon
```

> [!more] TLDR: name your pins
> `const int LED_PIN = 8;` at the top, and the sketch reads like a sentence.

## Verify, upload and the Serial Monitor

The tick button is **Verify**: it checks the code and shows errors, without a board. The arrow button is **Upload**: it verifies, then sends the program to the board. After each change, upload again.

The **Serial Monitor** (the magnifier at the top right) shows text that the board prints, which is how you look inside a running sketch.

```cpp
void setup() {
  Serial.begin(9600);                 // open the line at 9600 bits per second
}

void loop() {
  Serial.println(analogRead(A0));     // print a number and a new line
  delay(500);
}
```

The speed in the Serial Monitor (bottom right) must match the number in `Serial.begin`, or the text is garbage.

> [!more] TLDR: print to see
> When a sketch does not do what you expect, print the values it is using. It finds most problems faster than reading the code again.

## Libraries

A **library** is code that someone else wrote, so that you do not have to. The LCD and the servo in this course each use one. `Servo` comes with the IDE, and `LiquidCrystal_I2C` has to be installed.

1. Open **Sketch**, then **Include Library**, then **Manage Libraries** (or the books icon on the left).
2. Search for `LiquidCrystal I2C`, and choose the one by Frank de Brabander.
3. Click **Install**, and then write `#include <LiquidCrystal_I2C.h>` at the top of the sketch.

> [!more] TLDR: install once, include in every sketch
> The Library Manager downloads the code once, and the `#include` line in each sketch brings it in.

## Common errors

| Message | Cause | Fix |
|---|---|---|
| `expected ';' before ...` | a missing semicolon on the line above | add it |
| `'xyz' was not declared in this scope` | a spelling mistake, or a missing variable | check the name and the capital letters |
| `No such file or directory` after `#include` | the library is not installed | install it in the Library Manager |
| `Failed to connect` or the port is grey | wrong board or port, or a charge-only cable | check both menus, and try another cable |
| the sketch uploads but nothing happens | the wiring, or the wrong pin number | test the part with a very small sketch |

> [!more] TLDR: read the first error
> The IDE shows many errors, but the first one is usually the real one. Fix it, verify again, and the others often vanish.
