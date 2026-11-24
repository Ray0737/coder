---
title: Pins: digital, PWM and I2C
summary: What each kind of pin does, the limits to respect and the four functions you use most.
---

> [!aha] Every pin on the Uno is a tiny switch you can control or read. What changes from pin to pin is what else it can do: some can fade, some can measure, and two can talk to a screen.

## The pin map

Press each button and see which pins can do the job.

```widget
arduinopins
```

> [!more] TLDR: choose the pin by the job
> Digital for on or off, `~` for fading, A0 to A5 for measuring and A4 and A5 for a screen or an I2C sensor.

## Digital pins: HIGH or LOW

A digital pin is either **HIGH** (5 V) or **LOW** (0 V). You first say which way it works with `pinMode`, then write or read it.

```cpp
pinMode(8, OUTPUT);        // pin 8 sends a signal
digitalWrite(8, HIGH);     // 5 V
digitalWrite(8, LOW);      // 0 V

pinMode(2, INPUT_PULLUP);  // pin 2 listens
int state = digitalRead(2);   // HIGH or LOW
```

An output pin can give about **20 mA** safely (the absolute limit is 40 mA) and the whole chip about 200 mA. That is enough for an LED with a resistor, and not enough for a motor, a buzzer or a relay coil, so those need a driver.

> [!more] TLDR: pinMode first
> Set `pinMode` in `setup()` for every pin you use. A pin you forget stays an input, and the LED you write to will barely glow.

## PWM: faking an in-between voltage

A digital pin cannot give 2.5 V, but it can switch between 0 V and 5 V very fast. **PWM** (pulse width modulation) changes how long each pulse stays HIGH. A pin does this about 490 times a second, and the LED or motor sees the average. `analogWrite(pin, value)` takes a number from 0 (always off) to 255 (always on).

```widget
pwmwave
```

```cpp
analogWrite(9, 0);      // off
analogWrite(9, 64);     // about 25%
analogWrite(9, 128);    // about 50%
analogWrite(9, 255);    // full on
```

Only the pins marked **~** (3, 5, 6, 9, 10 and 11) can do this. On any other pin, `analogWrite` only turns it fully on or off.

> [!more] TLDR: the number is the share of time on
> 128 out of 255 is half the time HIGH, so the average is about 2.5 V. The pin is never really at 2.5 V.

## Analog pins: measuring a voltage

The pins A0 to A5 contain an **ADC**, a converter that measures a voltage between 0 V and 5 V and gives a whole number from 0 to 1023 (10 bits). One step is about 4.9 mV.

```cpp
int raw = analogRead(A0);              // 0 to 1023
float volts = raw * (5.0 / 1023.0);    // back to volts
```

This is the way to read a light sensor, a temperature sensor or a knob (a potentiometer). The Uno can only **read** analog values, and not produce them, so `analogRead` and `analogWrite` are not opposites.

> [!more] Math: from the number to the voltage
> The ADC splits 5 V into 1024 levels, so:
>
> ```math
> volts = raw * 5 / 1023          raw = volts / 5 * 1023          2.5 V reads about 512
> ```

## I2C: two wires for many devices

**I2C** is a way for the Uno to talk to a screen, a sensor or another board over just **two wires**: SDA (data) on **A4** and SCL (clock) on **A5**, plus power and ground. Each device has an **address**, a number such as `0x27`, so many devices can share the same two wires. The `Wire` library does the talking, and a device library, such as the LCD one, uses it for you.

| Wire | Uno pin | Job |
|---|---|---|
| SDA | A4 | the data |
| SCL | A5 | the clock that times the data |
| VCC and GND | 5V and GND | power |

> [!more] TLDR: two wires, an address each
> If A4 and A5 are used for I2C, you cannot use them for `analogRead` at the same time.

## Pins to leave alone

Pins **0 and 1** are the serial port, used by the USB cable and by `Serial.print`. If you connect something to them, uploading can fail and the Serial Monitor shows garbage. Start your own wiring at pin 2.

> [!more] TLDR: begin at pin 2
> The pins used in this course are 2 to 13 and A0 to A5, which avoids 0 and 1.
