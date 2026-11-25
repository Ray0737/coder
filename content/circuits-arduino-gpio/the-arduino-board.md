---
title: The Arduino board
summary: What a microcontroller is, the parts of an Arduino Uno and how to power it.
---

> [!aha] An Arduino is a tiny computer that does one job at a time and has no screen or keyboard of its own. Its strength is the row of pins along the edges, which can read a button or switch on an LED.

## A microcontroller, not a computer

The heart of the Uno is a chip called a **microcontroller**, the ATmega328P. It holds a processor, memory and pins in one piece. It has no operating system: when it gets power, it runs **your one program** from the start, and nothing else is going on. That is why it is so reliable for simple jobs, and why it starts in a moment.

| Part of the chip | Size on the Uno | What it is for |
|---|---|---|
| Flash memory | 32 KB | stores your program, and keeps it with the power off |
| SRAM | 2 KB | the variables your program uses while it runs |
| EEPROM | 1 KB | a few settings that must survive power-off |
| Clock | 16 MHz | 16 million steps each second |

> [!more] TLDR: small and exact
> 32 KB for the program and 2 KB for variables is very small, so Arduino code is short and avoids big arrays and long strings.
>
> - An `int` takes 2 bytes, so an array of 1000 of them would already fill the 2 KB of SRAM.
> - Quoted text in `Serial.println("...")` is also copied into SRAM, so many long messages can use it up. Strange crashes in a long sketch are often a full SRAM.
> - 16 MHz means a simple instruction takes about 62 nanoseconds, which is plenty fast for buttons, LEDs and sensors.

## The parts of the board

Look at the board below: every group of parts has one job.

```widget
arduinoboard
```

| Part | What it does |
|---|---|
| USB connector | brings 5 V power in, and carries your program and Serial Monitor text |
| Power jack | power from a 7 to 12 V adapter, when the USB cable is not used |
| ATmega328P | the microcontroller that runs the program |
| Reset button | starts the program again from the beginning |
| L (pin 13) | a small LED joined to pin 13, so a blink works with nothing wired |
| Digital pins | 0 to 13, the top row, for inputs and outputs |
| Analog pins | A0 to A5, the bottom right, for measuring a voltage |
| Power pins | 5V, 3V3, GND and VIN, the bottom left |

> [!more] TLDR: five groups to remember
> USB for power and upload, the chip, digital pins on top, analog pins and power pins at the bottom.
>
> Two extra things to remember: the reset button restarts your program but does not erase it, and pins 0 and 1 are shared with the USB connection, so keep them free while you upload and use the Serial Monitor. The analog pins A0 to A5 can also work as ordinary digital pins when you need more of them.

## Powering the board

The easiest way is the **USB cable**, which gives 5 V from your computer. It is also how the program is uploaded. When the project moves away from the computer, a battery pack or a 7 to 12 V adapter goes into the power jack, or into the **VIN** pin. The board turns that into a steady 5 V for the chip.

The **5V** pin is an output when the board is powered: it is the place to take 5 V for sensors. It can give a few hundred milliamps from USB, so it is fine for LEDs and small sensors but not for motors.

> [!more] TLDR: power in, 5V out
> USB, the jack or VIN feed the board. The 5V pin then feeds your parts, up to a few hundred milliamps.
>
> - USB can give about 500 mA in total, and the board itself uses some of it, so the parts you add get less than that.
> - VIN wants about 7 to 12 V. Never put more than 5 V into the 5V pin, because that skips the regulator that protects the chip.
> - The 3V3 pin gives 3.3 V for 3.3 V parts, but only a small current, about 50 mA.

## Arduino and Raspberry Pi

The Raspberry Pi in the earlier chapters is a full computer, and the Arduino is a microcontroller. They have pins in common, so it helps to compare them.

| | Arduino Uno | Raspberry Pi |
|---|---|---|
| Runs | one program, forever | an operating system and many programs |
| Language | C++, in the Arduino IDE | Python, and many others |
| Pin voltage | 5 V | 3.3 V |
| Analog inputs | yes, 6 | no, it needs a converter chip |
| Starts in | a fraction of a second | about a minute |
| Best at | reading sensors and switching things at exact moments | cameras, networking and AI |

The two work well together: the Arduino does the exact timing and the Pi does the thinking.

> [!more] TLDR: 5 V and 3.3 V
> The Uno's pins use 5 V and the Pi's use 3.3 V. Joining them directly can harm the Pi, so check the voltages first.
>
> A Pi pin is not 5 V tolerant, so a 5 V signal from the Uno going into the Pi needs a voltage divider or a level shifter on that wire. The other way is usually fine, because the Uno reads about 3 V and above as HIGH, but it is close to the limit. Always join the two GND pins as well, so both boards share the same 0 V.

## Other boards

This course uses the **Uno**, so the pin numbers in every chapter are the Uno's. An Arduino Nano has the same chip in a smaller body, and an ESP32 is a faster board with Wi-Fi and different pin names. The ideas (digital, PWM, analog and I2C) carry over to all of them, but the numbers do not.

> [!more] TLDR: check the pin map of your board
> If you use another board, look up which pins have PWM and I2C before you copy a wiring.
>
> On the Uno, PWM is on pins 3, 5, 6, 9, 10 and 11, and I2C is on A4 (SDA) and A5 (SCL). A Nano matches these, but an ESP32 uses different GPIO numbers and runs at 3.3 V, so a 5 V sensor may not be safe on it. Check the voltage and the pin map, then copy the wiring.
