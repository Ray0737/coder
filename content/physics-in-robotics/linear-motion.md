---
title: Linear motion
summary: How to turn "go 47 cm forward" into a wheel speed, with one formula.
---

> [!aha] A motor does not know centimetres. It only knows turns per minute, so the whole job is converting a distance into a speed and a time.

## Speed is distance over time

The first formula of the course is the simplest one in physics. If something moves at a steady speed `v`, the distance it covers is `d = v * t`. A robot at 10 cm/s for 3 seconds travels 30 cm. A **wheel that rolls without slipping** adds one more fact: the robot moves at exactly the speed of the wheel's rim, and the rim speed is `v = omega * r`, where `omega` is how fast the wheel turns, in radians per second, and `r` is the wheel radius.

Motors are given **RPM** (turns per minute) and physics wants radians per second, so one conversion is needed: one turn is `2 * pi` radians and one minute is 60 seconds, so `omega = 2 * pi * RPM / 60`.

```python
import math

r = 3                                   # wheel radius in cm
rpm = 50
omega = 2 * math.pi * rpm / 60          # 5.24 rad/s
v = omega * r                           # 15.7 cm/s
print(47 / v)                           # 2.99 s to roll 47 cm
```

> [!more] Math: from RPM to cm per second
> Put the two relations together and the radius is the only thing that changes how far one RPM goes:
>
> ```math
> v = omega * r = (2 * pi * RPM / 60) * r          r = 3 cm, RPM = 50:   v = 15.7 cm/s
> ```
>
> Then `t = d / v = 47 / 15.7 = 3.0 s`. That is the 3 seconds (`t = 3000`) used in the final task, so the formula below is the same physics, rearranged.

## Speeding up takes time

A real robot cannot jump to full speed. **Acceleration** is the change of speed per second, `a = (v - v0) / t`, and a force is needed to give it: `F = m * a`. Starting from rest with a steady acceleration, the speed is `v = a * t` and the distance is `d = 0.5 * a * t^2`. So a robot that has to speed up for half a second has already travelled a little before it reaches its set speed, and it also slides a little when it stops.

The wheels only grip the floor up to a limit. The friction force can be at most `mu * m * g`, where `mu` is the grip of the floor. If the motors ask for more acceleration than that, the wheels spin or slip and the robot is no longer where the formula says.

> [!more] TLDR: the physics so far
> `d = v * t`, `v = omega * r` and `omega = 2 * pi * RPM / 60`. Acceleration and friction explain why a real robot never matches the formula exactly.

> [!more] TLDR: why the code stops early
> Because speeding up takes time and slipping is possible, the distance that the formula gives is never exact. It is the reason the programs stop 1 second early and why a real run needs a test and a small correction.

## One turn of the wheel

Every time the wheel turns once, the robot rolls forward by one **circumference**, which is `2 * pi * r`. A wheel with a radius of 3 cm rolls 18.85 cm per turn. So to go 47 cm, the wheel must turn `47 / 18.85`, about 2.5 times.

```python
import math

r = 3                              # wheel radius in cm
one_turn = 2 * math.pi * r         # 18.85 cm per turn
turns = 47 / one_turn              # 2.49 turns for 47 cm
```

> [!more] TLDR: distance to turns
> Distance divided by `2 * pi * r` is the number of wheel turns. A bigger wheel travels further per turn, so it needs fewer turns for the same distance.

## Turns to RPM

A motor is told how many turns per **minute** (RPM) to make, so the time matters too. If the robot gets 3 seconds for the move, the turns must happen in 3 seconds, which is 20 times faster than if it had a whole minute. This is the formula in `Task Final.ino`, and it gives the RPM needed for **each centimetre**.

```cpp
float rpm_unit = (1.0 / (2.0 * PI_VAL * wheelr)) * (60000.0 / t);   // t = 3000 ms
Motor.turnWheel(1, LEFT,  47 * rpm_unit);
Motor.turnWheel(2, RIGHT, 47 * rpm_unit);
```

> [!more] TLDR: why one number is enough
> `rpm_unit` is the RPM that moves the robot 1 cm in the time `t`, so any distance is just `distance * rpm_unit`. With a 3 cm wheel and 3 seconds it is about 1.06, so 47 cm needs about 50 RPM.

> [!more] Math: the formula
> Turns needed, divided by the minutes available:
>
> ```math
> RPM = (distance / (2 * pi * r)) * (60000 / t)         t in milliseconds
> ```
>
> With `r = 3 cm` and `t = 3000 ms`: `rpm_unit = 0.0531 * 20 = 1.061`, so `47 * 1.061 = 49.9 RPM`.

## Why one wheel is LEFT and the other RIGHT

The two motors are mounted facing opposite ways, like two people sitting back to back on a seesaw. To roll the robot **forward**, the left motor must turn `LEFT` and the right motor `RIGHT`, and to go backward both directions swap. This is why every straight line in the code has one of each.

```cpp
Motor.turnWheel(1, LEFT,  20);     // forward
Motor.turnWheel(2, RIGHT, 20);
Motor.turnWheel(1, RIGHT, 20);     // backward
Motor.turnWheel(2, LEFT,  20);
```

> [!more] TLDR: forward and backward
> Forward is `LEFT` on wheel 1 and `RIGHT` on wheel 2. Swap both to reverse. If the robot goes the wrong way on its first test, swap the two words.

## No feedback: dead reckoning

The robot never measures where it is. It only runs the motors for a set time and trusts the maths, which is called **dead reckoning**. If a wheel slips or the battery weakens, the error is never noticed or corrected, and it adds up with every move.

> [!more] TLDR: why runs drift
> There are no sensors, so a small error in each move grows over a long route. This is the most likely reason a robot misses a checkpoint, and not a bug in the formula.
