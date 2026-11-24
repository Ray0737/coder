---
title: Servo motor with PWM
summary: Wire a small servo, move it to an angle with the Servo library and keep the board safe from its current.
---

> [!aha] A servo is a motor that you tell **where** to go, not how fast to spin. It has a small circuit inside that moves the arm to the angle you ask for, and holds it there.

## How a servo is told the angle

A servo has three wires: power, ground and a **signal**. The angle is sent as a pulse on the signal wire, once every 20 milliseconds (50 times a second). The **width** of the pulse is the angle: a short pulse points the arm one way, and a longer one the other way. It is the same PWM idea as for the LED, but the Servo library does the timing for you.

Move the slider and watch the pulse.

```widget
servowire
```

> [!more] TLDR: pulse width is the angle
> About 0.5 ms is 0 degrees, 1.5 ms is the middle and 2.4 ms is 180 degrees on the Arduino Servo library. The exact ends differ a little from servo to servo.

## What you need

| Part | Note |
|---|---|
| SG90 micro servo | three wires, 5 V |
| Breadboard and jumper wires | |
| Optional: a separate 5 V supply | for a bigger servo, or for several |

The wires are **brown or black** (GND), **red** (5 V) and **orange or yellow** (signal).

> [!more] TLDR: red, brown, orange
> If you are not sure, the red one is always power, and the darkest one is always ground.

## The wiring

1. Unplug the USB cable.
2. **Brown** (GND) to an Arduino **GND** pin.
3. **Red** (power) to the Arduino **5V** pin.
4. **Orange** (signal) to **pin 6**, as in the tank sketch. Any digital pin works with the Servo library, and the `~` is not needed.

The signal wire carries almost no current, so it can go straight to the pin. The red wire carries the real current, and that is the one to think about.

> [!more] TLDR: the signal is easy, the power is not
> A servo can take a few hundred milliamps when it moves, and much more if it is blocked.

## Power: a servo is a motor

A small SG90 can take around 100 to 250 mA while it moves, and **well over 500 mA when it stalls**, which is when something stops the arm. The 5V pin of an Arduino on a USB cable can supply only about 500 mA for the whole board. If the servo pulls too much, the voltage drops and the Arduino **resets** or behaves oddly, and the servo twitches.

| Situation | What to do |
|---|---|
| one small servo, light load | power from the 5V pin is fine |
| the board resets when the servo moves | give the servo its own 5 V supply |
| bigger servos, or more than one | always a separate supply |

With a separate supply, join its **GND to the Arduino GND**, so that the signal has a common reference. Do not join the two 5V lines together.

> [!warn] Do not force the arm by hand while the servo is powered, and do not leave it pushing against a stop. A stalled servo takes the most current and gets hot.

> [!more] TLDR: a common ground, and never a joined 5V
> Two supplies need one shared GND. If the Arduino resets when the servo starts, the power is the problem and the code is not.

## Move it

```cpp
#include <Servo.h>          // comes with the IDE

Servo myservo;

void setup() {
  myservo.attach(6);        // the signal wire is on pin 6
}

void loop() {
  myservo.write(0);         // to 0 degrees
  delay(1000);
  myservo.write(90);        // to the middle
  delay(1000);
  myservo.write(180);       // to 180 degrees
  delay(1000);
}
```

A sweep, slow and smooth, uses a loop with a short delay:

```cpp
for (int a = 0; a <= 180; a++) {
  myservo.write(a);
  delay(15);                // gives the arm time to follow
}
```

`write(angle)` takes whole degrees. `writeMicroseconds(us)` takes the pulse width directly, such as 1500 for the middle, and gives finer control. The library turns off `analogWrite` on **pins 9 and 10** while it is in use, so keep PWM LEDs on 3, 5 and 11 in a sketch with a servo.

> [!more] TLDR: attach, then write
> `attach(pin)` once in `setup()`, then `write(angle)` whenever you want it to move. Give it time to get there with a `delay`.

## A valve for a tank

The tank sketch (`valve.ino`) puts the sensor, the servo and the LCD together. The servo is a **valve**: it opens when the level is low, closes when the level is high, and holds its place in between, so it does not keep switching back and forth.

```cpp
if (levelPercent < 30)       valveServo.write(SERVO_OPEN_ANGLE);     // 90: low, let water in
else if (levelPercent > 80)  valveServo.write(SERVO_CLOSED_ANGLE);   // 0: high, stop
// between 30% and 80%: do nothing, keep the last position
```

The gap between 30% and 80% is called **hysteresis**. Without it, a level hovering at one value would make the valve chatter open and shut. One more caution from the sketch: `valveServo.read()` returns the last angle that was **written**, not where the arm really is, so a servo that is blocked still reports the angle you asked for.

> [!more] TLDR: two thresholds, not one
> A valve that opens at 30% and closes at 80% settles. A valve that switches at one value flutters.

## If it does not work

| Symptom | Cause |
|---|---|
| nothing moves | the signal wire is not on the pin in `attach()`, or the power is not connected |
| it twitches and the Arduino restarts | not enough current: give it its own supply |
| it hums and does not reach the angle | the arm is blocked, or the supply is too weak |
| it goes to the wrong end | the angle is mirrored: use `180 - angle` |

> [!more] TLDR: power first
> Most servo problems are power problems. Fix them before you change the code.
