---
title: Differential drive speeds
summary: One rule for straight lines, curves and pivots, from the speed of each wheel.
---

> [!aha] A differential drive robot steers by the difference between its two wheels. The same speed goes straight, a smaller difference goes in a curve, and one wheel stopped makes it pivot.

## Three moves, one idea

The robot has no steering wheel. What it does only depends on the two wheel speeds, so every move in the course is one of three kinds.

| Wheels | The robot |
|---|---|
| both the same | goes straight |
| both forward, different speeds | drives a curve, towards the slower wheel |
| one stopped, one moving | pivots around the stopped wheel |

> [!more] TLDR: the speeds are the steering
> Faster on the left turns the robot right, and faster on the right turns it left. The bigger the difference, the tighter the turn.

## The physics of two wheels

The robot's own speed and turning rate come from the speeds of its two wheels, `vL` and `vR` (in cm/s), and the **track** `L`, the distance between the wheels. The centre of the robot moves at the **average** of the two, and the robot **rotates** at the difference divided by the track:

`v = (vR + vL) / 2`      `omega = (vR - vL) / L`

If `vR` is bigger than `vL`, the robot turns left. If they are equal, `omega = 0` and the robot goes straight. If they are opposite, the robot spins on the spot. Every move in this course is a choice of `vL` and `vR`.

```python
L = 15                                   # track in cm
vL, vR = 6.6, 11.6                       # cm/s, the wheel speeds of the circle task
v = (vR + vL) / 2                        # 9.1 cm/s : the speed of the robot's centre
omega = (vR - vL) / L                    # 0.33 rad/s, turning left
R = (L / 2) * (vR + vL) / (vR - vL)      # 27 cm : the radius of the circle
```

> [!more] TLDR: speed and turn from two wheels
> The robot's speed is the average of the wheel speeds and its turning rate is their difference divided by the track.

> [!more] Math: the radius of the turn
> The robot circles a point on the line between its wheels. Dividing the speed by the turning rate gives the radius of the path of the robot's centre:
>
> ```math
> R = v / omega = (L / 2) * (vR + vL) / (vR - vL)
> ```
>
> With `vR = 11.6 cm/s`, `vL = 6.6 cm/s` and `L = 15 cm`, `R = 27 cm`, close to the 30 cm circle of the task. With one wheel stopped (`vL = 0`) the formula gives `R = L / 2`, so the robot turns around a point under the stopped wheel, and with `vR = -vL` it gives `R = 0`, the spin on the spot.

## Pivot on one wheel

To turn on the spot by 90 degrees, one wheel stays still and the other rolls along an arc whose radius is the **track**, the distance between the wheels. For 90 degrees that is a quarter of a circle. The arc is turned into centimetres, and the same `rpm_unit` from the linear motion chapter changes it into an RPM.

```cpp
float dist90 = (2.0 * PI_VAL * track) * 0.25;       // 23.6 cm for a 15 cm track
Motor.turnWheel(1, RIGHT, dist90 * rpm_unit);        // this wheel rolls
Motor.turnWheel(2, RIGHT, 0);                        // this wheel stays
```

> [!more] TLDR: an angle is a distance
> A turn of any angle is a distance along a circle with the track as its radius. Once it is a distance, `distance * rpm_unit` gives the speed, exactly as for a straight line.

> [!more] Math: any angle
> The moving wheel travels the fraction `angle / 360` of the circle of radius `track`:
>
> ```math
> distance = 2 * pi * track * (angle / 360)          90 degrees: 23.6 cm      60 degrees: 15.7 cm
> ```
>
> With `rpm_unit = 1.061`, 90 degrees needs 25.0 RPM and 60 degrees needs 16.7 RPM, over 3 seconds.

> [!more] Math: why the arc is `track * angle`
> When the left wheel is held still, the right wheel is the only one that moves, and it moves along a circle whose radius is the track `L`. An angle `theta` (in radians) cuts an arc of length `s = L * theta` on that circle. With `theta = 90 degrees = pi / 2`, `s = 15 * 1.571 = 23.6 cm`, which is the `dist90` of the code.

## A curve

For a curve, both wheels move, at different speeds, and the same radius formula from the circle chapter is used for each. In the final task, a half turn (180 degrees) is driven in 10 seconds with a radius of 11 cm on the inside and 27 cm on the outside.

```cpp
int theta = 180;   int t2 = 10000;
float innerr = 11; float outerr = 27;
int innerrpm = (theta * innerr * 60000) / (3 * t2 * 360);    // 11 RPM
int outerrpm = (theta * outerr * 60000) / (3 * t2 * 360);    // 27 RPM
```

> [!more] TLDR: a curve is two radii
> Choose the radius for each wheel, and the formula gives its RPM. The longer the time, the smoother the curve.

## A star: turn, go, turn

`Task Star Movement.ino` uses these same ideas. A five-point star is five repeats of: go forward, turn right by 72 degrees, go forward, then turn left by 144 degrees. Only the angles change, and the code from this chapter does the rest.

> [!more] TLDR: a path is a list of moves
> A star, a circle and the final mission are all a list of straight lines and turns. The robot only needs the speed for each wheel and how long to wait for each one.
