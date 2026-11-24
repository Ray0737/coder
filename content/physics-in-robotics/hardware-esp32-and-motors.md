---
title: Hardware: ESP32 and motors
summary: The brain, the muscles and the one wire that joins them.
---

> [!aha] The robot is a small computer (the ESP32) that sends short messages to two smart motors over a shared wire. The motors do the moving, and the ESP32 only decides what to tell them.

## The parts

| Part | Job |
|---|---|
| ESP32 | the brain, runs the Arduino sketch |
| 2 smart servo motors | the wheels, each with its own ID (1 and 2) |
| RS485 bus on `Serial2` | the wire the messages travel on |
| GPIO 4 | the direction switch for the bus |
| a hobby servo on GPIO 16 | an extra arm, driven with `ESP32Servo` |
| 3D-printed chassis | the body, the wheels and the arm, drawn in Onshape |

> [!more] TLDR: who does what
> The ESP32 thinks, the smart motors move and the printed parts hold them together. The USB `Serial` is only for printing numbers to your computer.

## Smart motors, not plain motors

A plain DC motor is just on or off, and you change its speed with the voltage. A **smart servo** has its own small chip inside. You send it a message such as "motor 1, turn at 20 RPM" and it holds that speed by itself. Every motor on the same wire has an **ID**, so a message for wheel 1 is ignored by wheel 2.

```cpp
Motor.turnWheel(1, LEFT,  20);     // ID 1
Motor.turnWheel(2, RIGHT, 20);     // ID 2
```

> [!more] TLDR: an ID per motor
> Both motors share one wire, and the ID in each message says who it is for. Wheel 1 is the left wheel and wheel 2 is the right wheel.

## One wire, two directions

RS485 uses a single pair of wires for sending **and** receiving, like a walkie-talkie where only one side can talk at a time. The ESP32 uses **GPIO 4** to switch between talking and listening. It sets the pin high before it sends and waits until every byte has left.

```cpp
digitalWrite(4, 1);                 // talk
Serial2.write(packet, length);
Serial2.flush();                    // wait until the last byte is sent
```

> [!more] TLDR: the direction pin
> High means the ESP32 is sending and low means it is listening. If the pin is wrong, the motors never hear a thing and nothing moves, and nothing prints either.

## The extra servo

A normal hobby servo on **GPIO 16** is the arm for the final task. It is driven with the `ESP32Servo` library, which you install from the Arduino Library Manager.

```cpp
#include <ESP32Servo.h>
Servo myservo;
myservo.attach(16);
```

> [!more] TLDR: two kinds of servo
> The two wheel servos use the motor library over RS485. The arm servo is a different, simpler part and uses `ESP32Servo` on its own pin.
