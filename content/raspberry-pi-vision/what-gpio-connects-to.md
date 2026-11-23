---
title: What GPIO connects to
summary: The 40-pin header on the Pi: which pins are power, ground and general GPIO, and how a script starts and ends safely.
---

> [!aha] **GPIO** stands for general-purpose input/output. Each pin is a tiny switch you can control from code. As an **output** it sets a wire HIGH (3.3 volts) or LOW (0 volts). As an **input** it reads whether something outside is pushing the wire high or low.

## The 40-pin header

The header has 40 pins in two rows. Not all are GPIO. Many are power or ground, and a few have special jobs. Every pin has two names, and mixing them up is the commonest mistake. Your scripts use **BCM numbers**, set with `GPIO.setmode(GPIO.BCM)`, so `GPIO18` is physical pin 12. Click a pin in the diagram below to see its job, and try the "Used in the course" tab.

| Numbering | What it means | Example |
|---|---|---|
| **Physical** (board) | Counting along the pins from 1 to 40 | Pin 12 |
| **BCM** (Broadcom) | The chip's own GPIO number | GPIO18 |

```widget
gpiopins
```

> [!compare] Think of it like seats in a theatre. Each seat has a row-and-column label printed on the ticket (the physical position) and a number the manager uses on the guest list (the BCM number). You must use the one the manager's list expects, and `setmode` is how you tell the code which list you mean.

## The kinds of pin

| Kind | Pins | What it is |
|---|---|---|
| 3.3 V power | 1, 17 | A 3.3 volt supply |
| 5 V power | 2, 4 | Straight from the supply, 5 volts |
| Ground | 6, 9, 14, 20, 25, 30, 34, 39 | 0 volts. Every circuit needs one |
| General GPIO | Most of the rest | Digital in or out |
| Hardware PWM | GPIO12, 13, 18, 19 | Can make smooth PWM |
| I2C bus | GPIO2 (SDA, pin 3), GPIO3 (SCL, pin 5) | The two wires for the I2C LCD. Fixed by the hardware |

## Three rules that protect the pins

- **3.3 volts only.** A GPIO pin is not 5 volt tolerant. The HC-SR04's Echo pin gives 5 volts, so put a voltage divider on that wire.
- **A trickle of current.** A pin can power an LED through a resistor, but never a motor. Use a driver board, as in the motor section of the next chapter.
- **Clean up.** End every script with `GPIO.cleanup()` in a `finally` block, so the pins are released even after Ctrl+C or a crash.

## Ctrl+C and cleanup: ending a script safely

A script with `while True:` never finishes by itself, so you stop it with **Ctrl+C** in the terminal. This is the part that is different from Arduino, so it is worth understanding.

1. **Ctrl+C** sends an interrupt. Python raises a **`KeyboardInterrupt`** inside whatever line is running.
2. The **`except KeyboardInterrupt:`** block catches it, so the program ends politely instead of crashing with an error. This is a good place to print a message.
3. The **`finally:`** block then runs, **always**: after a normal finish, after Ctrl+C and even after a crash.
4. **`GPIO.cleanup()`** inside `finally` hands every pin you used back to the system, as an input again.

```python
GPIO.setmode(GPIO.BCM)
try:
    while True:
        ...                                   # the main loop
except KeyboardInterrupt:
    print("\nProgram interrupted by user.")    # Ctrl+C lands here
finally:
    GPIO.cleanup()                            # always runs, releases the pins
```

> [!warn] Skip the cleanup and the pins keep their last state. An LED stays lit, a motor keeps spinning, and the next run complains that the "channel is already in use". PWM objects need `pwm.stop()` before `GPIO.cleanup()`. An Arduino has no such step: its `loop()` runs until you cut the power. A Pi runs your script as one program among many, so it has to hand the pins back when it ends.

> [!aha] **Same hardware as your microcontrollers subject.** The LEDs, buttons, ultrasonic sensor, motor driver, servo and LCD in this course are the very same parts you wired to an Arduino or ESP32. The wiring and the electronics do not change at all. What changes is the **code**: Python on a Pi instead of C++ on a microcontroller, with a few new habits such as `GPIO.setmode`, `GPIO.cleanup()` and a PWM duty cycle of 0 to 100.

## Try it

1. GPIO18 is which physical pin? Which BCM number is physical pin 33?
2. Why is `GPIO.cleanup()` in a `finally` block, and not just at the end?
3. What happens to an LED that is lit when you press Ctrl+C, if the script has no `GPIO.cleanup()`?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| GPIO pin | A light switch you can flip from code | Output (set HIGH or LOW) or input (read) |
| BCM vs physical | The ticket label vs the guest-list number | Two ways to name the same pin |
| `KeyboardInterrupt` | Pressing the stop button | What Ctrl+C raises inside the script |
| `GPIO.cleanup()` | Putting the tools back | Releases the pins when the script ends |
