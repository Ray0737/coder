---
title: Motor protocol: Dynamixel 2.0
summary: What the ESP32 actually sends to a motor, byte by byte.
---

> [!aha] `Motor.turnWheel(1, LEFT, 50)` looks like one line, but it builds a short message of bytes with a header, an ID, a command and a checksum. A motor only obeys a message that is exactly in this shape.

## A packet

A **packet** is a row of bytes. In Dynamixel Protocol 2.0 every packet starts with the same header, then says who it is for, how long it is and what to do, and ends with a **CRC**, a checksum that lets the motor check that nothing was damaged on the wire.

| Bytes | Meaning |
|---|---|
| `FF FF FD 00` | the header, always the same |
| ID | which motor (1 or 2) |
| length (2 bytes) | how many bytes follow |
| instruction | `0x03` means write |
| address (2 bytes) | which setting to change |
| data | the new value |
| CRC (2 bytes) | the checksum |

> [!more] TLDR: the same frame every time
> Header, ID, length, instruction, address, data and CRC. Only the address and the data change from one command to the next.

## Switching a motor on

Before a wheel will move, two settings are written once, in `Motor.begin()`. The first turns the **torque** on at address `0x40`, and the second sets the **operating mode** at address `0x0B`, so the motor takes speed commands.

```cpp
packet[7]  = 0x03;     // write
packet[8]  = 0x40;     // address: torque enable
packet[10] = 0x01;     // value: on
```

> [!more] TLDR: begin() does the setup
> `Motor.begin()` turns the torque on and sets the mode for motor 1 and motor 2. Without that, the speed commands arrive and nothing happens.

## Setting a speed

The speed is written to address `0x68`, the goal velocity, as a 4-byte number. The motor counts in steps of **0.229 RPM**, so the library divides the RPM by 0.229. A wheel on the `RIGHT` gets the same number with a minus sign, because its motor is mounted the other way.

```cpp
int Speed = RPM / 0.229;          // 49.9 RPM becomes 217
if (SIDE == RIGHT) Speed = Speed * (-1);
```

> [!more] TLDR: RPM to motor units
> 49.9 RPM is 217 steps, sent as the bytes `D9 00 00 00`. On the right wheel the number is -217, which is `27 FF FF FF`.

> [!more] Math: the two's complement
> A negative number is stored as `2^32` minus its size, so -217 becomes `0xFFFFFF27`. The bytes are sent with the smallest first (little-endian), so they arrive as `27 FF FF FF`.

## Two protocols in one folder

The folder has a mix. `Motor.h` and `Motor.cpp` describe an older **Protocol 1.0** (header `FF FF`), but `turnWheel` calls `turn()` from `MotorV2.h`, which builds **Protocol 2.0** packets. So the wheels work, but the other functions in `Motor.h`, such as `move` and `readPosition`, would send the wrong kind of packet to the motors.

> [!more] TLDR: only turnWheel is safe
> Stick to `Motor.begin()` and `Motor.turnWheel()`. The rest of the library was written for a different protocol than the one the motors listen to.
