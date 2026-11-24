---
title: Ultrasonic sensor (HC-SR04)
summary: Measure distance with sound: how the sensor works, how to wire it and how to read it safely.
---

> [!aha] The HC-SR04 is a bat in a box. It sends out a click you cannot hear, waits for the echo and measures the time. The Arduino turns that time into a distance.

## How it measures

The sensor has two round parts: a **speaker** (T) and a **microphone** (R). You tell it to start by sending a short pulse of **10 microseconds** to the **Trig** pin. It then sends eight bursts of ultrasonic sound, and sets the **Echo** pin HIGH for as long as the sound takes to go to the object and come back. So the width of the Echo pulse is the travel time.

Sound travels about **343 metres per second** in air at room temperature, which is **0.0343 cm per microsecond**. The sound goes there **and back**, so the distance is half:

```text
distance (cm) = echo time (microseconds) x 0.0343 / 2
```

Drag the wall and see the timing.

```widget
sonartiming
```

> [!more] TLDR: time to distance
> About 58 microseconds of echo for each centimetre. A wall 50 cm away gives an echo of about 2915 microseconds.

## The wiring

You need an HC-SR04, a breadboard and four jumper wires. The sensor has four pins in a row, labelled **VCC, Trig, Echo, GND**.

1. Unplug the USB cable.
2. Put the sensor on the breadboard, or use four jumpers straight from its pins.
3. **VCC** to the Arduino **5V**.
4. **Trig** to **pin 9**.
5. **Echo** to **pin 10**.
6. **GND** to **GND**.

```widget
sonarwire
```

The Echo pin is 5 V, which the Uno can read. A 3.3 V board such as the Raspberry Pi would need a voltage divider on it first, using the divider from the earlier chapter.

> [!more] TLDR: five volts, four wires
> Trig is an output, Echo is an input. If you swap them, the sensor never gets a pulse, and the reading is always 0.

## Read it

```cpp
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);          // a clean start
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);         // the 10 microsecond pulse
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long t = pulseIn(ECHO_PIN, HIGH, 30000);   // wait up to 30 ms for the echo
  float cm = t * 0.0343 / 2;

  Serial.println(cm);
  delay(100);
}
```

`pulseIn(pin, HIGH, timeout)` waits for the pin to go HIGH, then times how long it stays HIGH, in microseconds. The third number is a **timeout**: if no echo comes in 30 ms, it gives up and returns 0.

> [!more] TLDR: pulse out, pulse in, divide by two
> `delayMicroseconds(10)` for the trigger, `pulseIn` for the echo, and `* 0.0343 / 2` for the distance.

## A zero is not a distance

When `pulseIn` times out, `t` is 0, and the formula gives **0 cm**, which looks like the object is touching the sensor. This happens when the sensor is unplugged, the object is too far (more than about 4 m), or it is angled so that the sound bounces away. If a program uses 0 as "the tank is full", it makes a dangerous decision.

```cpp
if (t == 0) {
  Serial.println("no echo");        // do not trust this reading
} else {
  float cm = t * 0.0343 / 2;
}
```

The sensor also works best with a flat surface facing it, within about 2 cm to 400 cm, and a cone of about 15 degrees. Soft cloth absorbs the sound, and small or angled objects may be missed.

> [!more] TLDR: check for zero
> Always treat a 0 from `pulseIn` as "no reading", and decide what the program does then.

## Level of a tank

The tank-valve sketch (`valve.ino`) hangs the sensor over a tank and turns the distance into a **fill percentage**, using one constant: the distance from the sensor to the bottom of an empty tank.

```cpp
const float TANK_HEIGHT_CM = 200.0;                       // sensor to the empty bottom (measure yours)
float level_cm = TANK_HEIGHT_CM - cm;                     // the water height
float percent = constrain(level_cm / TANK_HEIGHT_CM * 100.0, 0, 100);
```

A closer surface means a smaller distance and a fuller tank. Measure `TANK_HEIGHT_CM` for your own container before you trust the number.

> [!more] TLDR: full is a short distance
> The sensor looks down at the water, so the distance gets smaller as the tank fills. The percentage is `(height - distance) / height`.
