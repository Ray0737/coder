---
title: The final mission
summary: A blind run through three stations and five checkpoints, built from the moves in this course.
---

> [!aha] The final mission uses nothing new. It is the same straight lines, pivots and one curve from the earlier chapters, written one after another and tuned until the robot reaches the end.

## The track

The robot starts at the green star and must finish at the orange star, going past three stations along the way. There is also a ready point (the yellow square) and a detection point, drawn with a 140 mm by 100 mm area beside it.

![The final task track: three stations, a start point, a ready point, a detection point and an end point](assets/classworkpic/final-task.png)

> [!more] TLDR: the labels
> The Thai labels are: สถานีที่ 1, 2 and 3 are stations 1, 2 and 3. จุดเริ่มต้น is the start, จุดสิ้นสุด is the end, จุดเตรียมความพร้อม is the ready point and จุดตรวจจับ is the detection point.

## One move at a time

The mission is a list of moves in `execute()`. Every move starts the two wheels, waits for `t` milliseconds and then calls `stop()`, so a move never runs into the next one. At a checkpoint the robot also waits a fixed time, so someone can see that it arrived.

```cpp
void stop() {
  Motor.turnWheel(1, LEFT, 0);
  Motor.turnWheel(2, RIGHT, 0);
  delay(1000);
}

// forward 47 cm to the first box, then wait 3 seconds
Motor.turnWheel(1, LEFT,  47 * rpm_unit);
Motor.turnWheel(2, RIGHT, 47 * rpm_unit);
delay(t); stop();
delay(3000);
```

> [!more] TLDR: the same four lines, many times
> Set both wheels, wait `t`, stop, and pause if it is a checkpoint. The route is a long list of these, each with a different distance.

## The route in order

| Moves | What it is |
|---|---|
| forward 47 cm | to the first checkpoint |
| a small step back, then a 90 degree pivot | turn towards the second checkpoint |
| back 44 cm, wait, forward 44 cm | in and out of the second checkpoint |
| 90 degree turn, forward 5 cm | towards the third checkpoint |
| forward 22 cm, wait | the fourth checkpoint |
| two 90 degree pivots, back 22 cm, wait | the fifth checkpoint |
| back 5 cm, 90 degree pivot, forward 34 cm | to the curve |
| a 180 degree curve, forward 16 cm | round the bend |
| 60 degree pivot, forward 29 cm | the final dash |

> [!more] TLDR: three kinds of move
> Straight lines use `distance * rpm_unit`, pivots use `dist90` and `dist60`, and there is exactly one curve, with 11 RPM on the inside wheel and 27 RPM on the outside. Everything is in the Differential drive chapter.

## It is blind

Nothing in the code measures where the robot is. Wheel slip, a weak battery or an uneven floor each shift the robot a little, and the shifts add up over fourteen moves. That is why a route like this has to be tested and adjusted on the real robot, and not only calculated.

```cta
play | Watch the final run | The recording of the robot doing the final task.
The final task video | https://spsm20-my.sharepoint.com/:v:/g/personal/024329_spsm_ac_th/IQBE0yjJbJO8SaqwOsM-tu3aAQg2vVKQMU0zcIXW1vRjsqA?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=WQxsne | School account link
```

> [!more] TLDR: how to improve it
> Add a sensor and a check after each move, so that the robot corrects its own position. Until then, the best habit is to test one move at a time and write the fixes into the code. You can read the whole file on the [Work page](work.html#physics-in-robotics/final.ino).
