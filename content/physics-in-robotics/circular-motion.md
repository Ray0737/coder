---
title: Circular motion
summary: Driving a circle by running the two wheels at different speeds.
---

> [!aha] A robot drives a circle without steering. It only needs the outer wheel to go faster than the inner wheel, because the outer wheel has a longer way to travel.

## The physics of going round

Going round a circle at a steady speed is still **accelerating**, because the direction keeps changing even when the speed does not. The robot turns through the angle `theta` at a rate `omega = v / R` (radians per second), where `R` is the radius of its path, and one full lap takes `T = 2 * pi * R / v`. The acceleration points towards the centre and is `a = v^2 / R`.

An acceleration needs a force: the **centripetal force** `F = m * v^2 / R`. On a robot it is the friction between the wheels and the floor that provides it. If the robot goes too fast for the radius, the friction is not enough and it slides out of the circle. For the task here the path is about 30 cm and a lap takes 20 seconds, so `v = 2 * pi * 30 / 20 = 9.4 cm/s` and `a = v^2 / R = 3 cm/s^2`, which is far below what the floor can hold, so the robot follows the circle without sliding.

```python
import math

R, T = 30, 20                            # path radius in cm, time for one lap in s
v = 2 * math.pi * R / T                  # 9.4 cm/s
a = v ** 2 / R                           # 2.96 cm/s^2, towards the centre
```

> [!more] TLDR: a circle needs a force
> Going round is accelerating towards the centre, `a = v^2 / R`, and friction supplies the force. A tighter circle or a higher speed needs more grip.

> [!more] Math: speed along a circle
> Every point on a turning body has the same `omega`, but a point further from the centre has to cover a longer circle in the same time, so it is faster:
>
> ```math
> v = omega * R          so   v_outer / v_inner = R_outer / R_inner = 37 / 21 = 1.76
> ```
>
> This is the reason the outer wheel must turn 1.76 times as fast as the inner one.

## Two wheels, two circles

When the robot goes round a circle, its two wheels draw two circles of different sizes. The outer wheel draws the bigger one, so in the same time it must roll further, and therefore faster. The speeds must be in the same ratio as the two radii, or the robot will not follow the circle.

```cpp
float innerr = 21;     // radius of the circle the inner wheel follows, in cm
float outerr = 37;     // radius of the circle the outer wheel follows, in cm
```

> [!more] TLDR: the ratio
> The two radii differ by about the distance between the wheels. Here 37 - 21 = 16 cm, close to the 15 cm track. The speed ratio is then `37 / 21`.

## From the radius to an RPM

The wheel must roll along an arc of `angle / 360` of the full circle, in the time you allow. The same idea as in straight motion gives the RPM for any radius and any angle.

```cpp
int theta = 360;          // a full circle
int t = 20000;            // 20 seconds, in ms
int innerrpm = (theta * innerr * 60000) / (3 * t * 360);    // 21 RPM
int outerrpm = (theta * outerr * 60000) / (3 * t * 360);    // 37 RPM
```

> [!more] TLDR: reading the formula
> The `3` in the code is the wheel radius in cm. With 360 degrees in 20 seconds, the RPM comes out equal to the radius, 21 and 37, which is easy to check by hand.

> [!more] Math: where it comes from
> The wheel rolls `(theta / 360) * 2 * pi * R` along its circle, and one wheel turn is `2 * pi * r`, so the number of turns is `theta * R / (360 * r)`. Spread over `t` milliseconds:
>
> ```math
> RPM = (theta * R * 60000) / (360 * r * t)          R = radius of the wheel's path, r = wheel radius
> ```

## Run it

The motors are started once, left running for almost the whole time, and then stopped. The inner wheel is wheel 1 and the outer wheel is wheel 2, so the robot circles to the left.

```cpp
Motor.turnWheel(1, LEFT,  innerrpm);
Motor.turnWheel(2, RIGHT, outerrpm);
delay(t - 1000);                       // stop 1 second early, because the motors need time to speed up
Motor.turnWheel(1, LEFT,  0);
Motor.turnWheel(2, RIGHT, 0);
```

> [!more] TLDR: the early stop
> The motors take a moment to reach their speed, so the robot has not travelled the full path by `t`. The code stops 1 second early by trial and error. It is a small correction for a real motor, not for the maths.

## Watch for the numbers that disagree

`Task Circular Motion.ino` declares `int wheelr = 3.5`, but an `int` cuts off the decimals, so it holds 3, and the formula uses a typed `3` anyway. The wheel radius is also different from the 3.0 in `Task Final.ino`. When a number is typed in many places, it is easy for one to be left behind.

> [!more] TLDR: one constant, one place
> If the wheel size changes, every file with a copy of it must change. Keep the constants at the top and use the names in the formulas.
