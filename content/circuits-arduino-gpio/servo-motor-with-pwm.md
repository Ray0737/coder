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
>
> - The pulse repeats every 20 ms, and the servo only holds its angle while the pulses keep arriving.
> - If a servo buzzes at 0 or 180, its real range is a little shorter than the library assumes. Stay inside about 10 to 170 degrees, or use `writeMicroseconds` to find the true ends.
> - The whole 0 to 180 degree range fits inside a pulse change of only about 2 ms, so `writeMicroseconds` gives finer steps than `write`.

## What you need

| Part | Note |
|---|---|
| SG90 micro servo | three wires, 5 V |
| Breadboard and jumper wires | |
| Optional: a separate 5 V supply | for a bigger servo, or for several |

The wires are **brown or black** (GND), **red** (5 V) and **orange or yellow** (signal).

> [!more] TLDR: red, brown, orange
> If you are not sure, the red one is always power, and the darkest one is always ground. The signal is the one left over, and it is usually orange, yellow or white.
>
> On the common 3-pin plug the order is brown, red, orange, so the plug only fits one way round. A plug pushed on backwards puts 5 V on the signal pin and can damage the servo, so check the colours against the pins before you power up.

## The wiring

1. Unplug the USB cable.
2. **Brown** (GND) to an Arduino **GND** pin.
3. **Red** (power) to the Arduino **5V** pin.
4. **Orange** (signal) to **pin 6**, as in the tank sketch. Any digital pin works with the Servo library, and the `~` is not needed.

The signal wire carries almost no current, so it can go straight to the pin. The red wire carries the real current, and that is the one to think about.

> [!more] TLDR: the signal is easy, the power is not
> A servo can take a few hundred milliamps when it moves, and much more if it is blocked.
>
> The signal wire carries well under 1 mA, so the pin has no trouble with it. The red wire is the one that matters: a small SG90 uses 100 to 250 mA moving and over 500 mA stalled, and a USB port gives about 500 mA for the whole board. Rule of thumb: when a servo misbehaves, suspect the power first, not the pin.

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
>
> - Without the shared GND the signal has no reference level, so the servo jitters or ignores you.
> - Joining the two 5V lines makes two supplies push against each other, which can damage either one.
> - A quick test: unplug the servo and run the sketch. If the resets stop, the servo is pulling too much current from the board.

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
>
> A servo does not jump to the angle. A small SG90 turns about 60 degrees in 0.1 to 0.2 seconds, so a move across the whole 180 degrees takes roughly half a second, and a `delay(1000)` between far moves is safe. Do not call `attach` inside `loop()`, and remember that writing the same angle again is harmless.

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
>
> At a level of 55% neither rule fires, so the valve keeps whatever position it had. Make the gap wider than the jitter of the sensor reading, which can be a few centimetres on a rippling surface. A home thermostat works the same way: it heats below one temperature and stops at a higher one.

## If it does not work

| Symptom | Cause |
|---|---|
| nothing moves | the signal wire is not on the pin in `attach()`, or the power is not connected |
| it twitches and the Arduino restarts | not enough current: give it its own supply |
| it hums and does not reach the angle | the arm is blocked, or the supply is too weak |
| it goes to the wrong end | the angle is mirrored: use `180 - angle` |

> [!more] TLDR: power first
> Most servo problems are power problems. Fix them before you change the code.
>
> 1. Check the red, brown and orange wires are on the right pins.
> 2. Check that every supply shares one GND.
> 3. Give the servo its own 5 V supply and see if the trouble goes away.
> 4. Only then look at the code, and test it first with the plain sweep sketch and nothing else attached.
