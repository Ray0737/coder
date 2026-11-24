---
title: Project setup
summary: What to install, which files go together and the shape every robot sketch has.
---

> [!aha] Every robot sketch is the same recipe: start the motors, wait a few seconds, run the moves once, and leave `loop()` empty.

## What you need

There is no Python here. The sketches are Arduino C++, sent to the ESP32 from the Arduino IDE (or PlatformIO). Three things have to match what the course used.

| Item | What to use |
|---|---|
| ESP32 board package | **2.0.17**, found easily in the Boards Manager |
| Motor library | `Motor.h`, `Motor.cpp` and `MotorV2.h` in a folder called `src`, in the same folder as the `.ino` file |
| Servo library | `ESP32Servo`, from the Library Manager (only the final task uses it) |

```cpp
#include "src/Motor.h"      // the motor library, in the src folder
#include <ESP32Servo.h>     // only the final task uses the arm
```

> [!more] TLDR: versions and folders
> Install the **esp32** board package at version 2.0.17 and keep the three motor files in a `src` folder next to the sketch. A different board package version may not behave the same, so use the same one if you can.

```cta
github-logo | Get the course files | The motor library, the sketches, the drawings and the CAD files.
Code - Robot on GitHub | https://github.com/eai-spsm/M.4-Classwork/tree/main/Code%20-%20Robot | Open the folder
```

## The shape of a sketch

Every task has the same skeleton. `setup()` opens the serial port and the motors, then waits 5 to 10 seconds so you can step back and place the robot. Then the moves run **once**, and `loop()` is empty, because the robot is not doing anything over and over.

```cpp
#define DirectionPin 4
#define BaudRate 115200

void setup() {
  Serial.begin(115200);
  Motor.begin(BaudRate, DirectionPin, &Serial2);
  delay(5000);               // time to get your hands away
  execute();                 // all the moves, one time
}

void loop() { }
```

> [!more] TLDR: run once, then nothing
> The mission lives in `setup()` or in a function it calls. The only way to stop a bad run is to cut the power, so keep the first test short.

## Things to know before you run it

The motor library works, but it has some surprises. `Motor.begin()` ignores the pin and the baud rate you pass in, and always uses `Serial2` at 115200 and pin 4. So changing them in your sketch changes nothing. Also, `Task Exercise.ino` has a missing semicolon after `int i = 1`, so it will not compile until you add one.

> [!more] TLDR: two honest warnings
> To change the direction pin or the serial port, edit the library file and not the call. And when a sketch does not compile, read the error line first, because one missing `;` is enough.
