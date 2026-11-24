---
title: Course overview
summary: What the Physics in Robotics course is, who runs it and what you build in it.
---

> [!aha] This course takes physics out of the textbook and puts it into a robot. You work out how fast each wheel must turn, write that as C++ and watch the robot drive a real route on its own.

## Who runs it

The course is **ว30256 Physics in Robot Technology**, a co-course between **FIBO**, the Institute of Field Robotics at KMUTT, and the AI-major students of Prasarnmit Demonstration School (**SPSM**). The physics ideas are turned into C++ code that controls a differential drive robot, until the robot can finish a final mission by itself.

| About | Detail |
|---|---|
| Course code | ว30256 |
| Course name | Physics in Robot Technology |
| Run by | FIBO, KMUTT, with the AI Major at SPSM |
| Physics | kinematics and arc length, turned into wheel RPM |
| Code | C++ on an ESP32 |
| Hardware | a differential drive robot, with a motor bus (RS485) |
| CAD | the chassis is designed in Onshape and printed by the class |
| Ends with | a 14-stage autonomous final mission |

> [!more] TLDR: the course in one line
> Physics in, code through, robot out: kinematics become RPM, RPM becomes C++, and the C++ drives the robot.

## What you make

There are four parts, and each one has its own chapters here.

| Part | What it is | Chapters |
|---|---|---|
| 3D CAD | the chassis, drawn in Onshape and printed by the class | Chassis design in Onshape |
| ESP32 + RS485 | the controller and the motor bus of the differential drive | Hardware, Motor protocol |
| Physics to RPM | kinematics and arc length turned into wheel speeds | Linear motion, Circular motion, Differential drive speeds |
| Final mission | 14 stages, run autonomously | The final mission |

> [!more] TLDR: the order to read
> Start with the physics chapters, then the hardware and the project setup, and finish with the CAD and the final mission. The Work page has every sketch, split into cells with an explanation for each.

## The path of one idea

One idea runs through the whole course. A distance in centimetres becomes a number of wheel turns, the turns become an RPM, and the RPM goes to the motor as a message. Every sketch, from the circle to the final mission, is that path repeated with different numbers.

```cpp
float rpm_unit = (1.0 / (2.0 * PI_VAL * wheelr)) * (60000.0 / t);   // cm to RPM
Motor.turnWheel(1, LEFT,  47 * rpm_unit);                            // RPM to the motor
Motor.turnWheel(2, RIGHT, 47 * rpm_unit);
```

> [!more] TLDR: one formula, many tasks
> If you understand `rpm_unit`, you understand all the sketches. The rest is choosing the distances and the turns.
