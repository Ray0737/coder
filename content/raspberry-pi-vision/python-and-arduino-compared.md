---
title: Python and Arduino compared
summary: The same parts you wired to an Arduino, now controlled from Python: the two languages side by side, part by part.
---

If you know Arduino C++ (the `.ino` sketches), the Pi does the same jobs with different calls. For each part here is the small piece that does the controlling, and the Arduino version next to it. The pin numbers are the ones your scripts use.

The parts go in this order: first the ones the Pi **controls** (an LED, its brightness, a motor, a servo), then the ones it **reads** (a button, the ultrasonic sensor), then the **screen**.

## Output, input and pull-up

```python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)                                    # number pins by GPIO (BCM) name
GPIO.setup(18, GPIO.OUT)                                  # an output: an LED
GPIO.setup(23, GPIO.IN, pull_up_down=GPIO.PUD_UP)         # an input: a button

try:
    while True:
        pressed = GPIO.input(23) == GPIO.LOW              # pressed reads LOW
        GPIO.output(18, GPIO.HIGH if pressed else GPIO.LOW)   # LED follows the button
        time.sleep(0.05)
except KeyboardInterrupt:
    print("\nStopped by user.")            # Ctrl+C lands here
finally:
    GPIO.cleanup()                         # always runs, releases the pins
```

A button wired between a pin and **GND** needs a pull-up. Without one, the pin is left "floating" and reads random noise. With the internal pull-up on, the pin sits at HIGH, and pressing the button connects it to ground so it reads **LOW**. That is why a press reads 0.

## The LED and its resistor

```python
import RPi.GPIO as GPIO
import time

LED_PIN = 18                  # GPIO18 > 220 ohm > LED anode (+), cathode (-) > GND

GPIO.setmode(GPIO.BCM)
GPIO.setup(LED_PIN, GPIO.OUT)

try:
    while True:
        GPIO.output(LED_PIN, GPIO.HIGH)
        time.sleep(1)
        GPIO.output(LED_PIN, GPIO.LOW)
        time.sleep(1)
except KeyboardInterrupt:
    print("\nStopped by user.")            # Ctrl+C lands here
finally:
    GPIO.cleanup()                         # always runs, releases the pins
```

The **220 ohm resistor** keeps the current to a safe level. Without it the LED, or the pin, can be damaged.

## PWM: faking in-between

A pin is only ever fully HIGH or fully LOW. **PWM** (pulse width modulation) flips it on and off very quickly, and the share of the time it is on, the **duty cycle**, acts like a level. An LED at 50% duty looks half as bright, and a motor at 50% runs at about half speed. A servo reads the pulse width as an angle.

```python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(13, GPIO.OUT)            # the pin must be an output first
pwm = GPIO.PWM(13, 1000)            # GPIO13 at 1000 Hz
pwm.start(0)                        # start at 0% duty

try:
    while True:
        for brightness in range(0, 256, 5):
            pwm.ChangeDutyCycle((brightness / 255) * 100)   # map 0-255 to 0-100 %
            time.sleep(0.02)
except KeyboardInterrupt:
    print("\nStopped by user.")            # Ctrl+C lands here
finally:
    pwm.stop()                             # stop the PWM before cleanup
    GPIO.cleanup()                         # always runs, releases the pins
```

## The same idea in two languages

| Job | Arduino (C++) | Raspberry Pi (Python) |
|---|---|---|
| Choose how a pin numbers | Pin numbers are fixed | `GPIO.setmode(GPIO.BCM)` first |
| Make a pin an output | `pinMode(pin, OUTPUT)` | `GPIO.setup(pin, GPIO.OUT)` |
| Set a pin HIGH or LOW | `digitalWrite(pin, HIGH)` | `GPIO.output(pin, GPIO.HIGH)` |
| Read a pin | `digitalRead(pin)` | `GPIO.input(pin)` |
| Wait | `delay(1000)` (milliseconds) | `time.sleep(1)` (seconds) |
| Run forever | `void loop()` | `while True:` |
| Tidy up on exit | Nothing, power off | `GPIO.cleanup()` in `finally` |

## LED (digital output): `GPIO18` through 220 ohm

```python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)          # init: number pins by GPIO name
GPIO.setup(18, GPIO.OUT)        # init: the pin is an output

try:
    while True:
        GPIO.output(18, GPIO.HIGH)      # on
        time.sleep(1)                   # seconds, not milliseconds
        GPIO.output(18, GPIO.LOW)       # off
        time.sleep(1)
except KeyboardInterrupt:
    print("\nStopped by user.")            # Ctrl+C lands here
finally:
    GPIO.cleanup()                         # always runs, releases the pins
```

```cpp
void setup() {
  pinMode(18, OUTPUT);          // init
}
void loop() {
  digitalWrite(18, HIGH);
  delay(1000);                  // milliseconds
  digitalWrite(18, LOW);
}
```

## LED brightness (PWM): `GPIO13` through 220 ohm

On Arduino one call, `analogWrite`, does PWM. On the Pi you make a PWM object, start it, and change its duty cycle, which is 0 to 100 and not 0 to 255.

```python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(13, GPIO.OUT)        # init: the pin must be an output first
pwm = GPIO.PWM(13, 1000)        # init: pin, frequency in Hz
pwm.start(0)                    # init: start at 0% duty

try:
    while True:
        for duty in range(0, 101, 5):       # fade up, 0-100 percent
            pwm.ChangeDutyCycle(duty)
            time.sleep(0.03)
        for duty in range(100, -1, -5):     # fade down
            pwm.ChangeDutyCycle(duty)
            time.sleep(0.03)
except KeyboardInterrupt:
    print("\nStopped by user.")            # Ctrl+C lands here
finally:
    pwm.stop()                             # stop the PWM before cleanup
    GPIO.cleanup()                         # always runs, releases the pins
```

```cpp
pinMode(13, OUTPUT);            // init, in setup()
analogWrite(13, 128);           // 0-255 in one call, no start or stop
```

## DC motor through the L298N: `IN1` `GPIO18`, `IN2` `GPIO12`, `ENA` `GPIO13`

A pin cannot run a motor. A motor draws far more current than a pin can give, and it can push electrical noise back into the Pi. So the Pi only sends **three small signals** to a **driver board** (the L298N type), which has its own power supply and does the heavy work. Two pins pick the **direction** and one sets the **speed**.

> [!compare] Think of it like a quiet manager and a powerful crane. The manager (the Pi) only gives instructions: "up", "down", "slower". The crane (the driver) has its own engine and does the lifting.

### How the pins work

If `IN1` and `IN2` **match**, the motor stops. If they are **crossed** (one HIGH, one LOW), it runs, and the HIGH one sets the direction. `ENA` is the speed, a PWM signal at 1000 Hz: 0% is off and 100% is full power. Inside, an H-bridge of four switches does the reversing.

| IN1 | IN2 | Result |
|---|---|---|
| LOW | LOW | Match: stop |
| HIGH | HIGH | Match: stop (a brake) |
| HIGH | LOW | Crossed: forward |
| LOW | HIGH | Crossed: backward |

### Wiring it to a 2-cell lithium battery

A 2-cell (2S) pack with two wires is just a **+** and a **-**. It powers the motor through the driver, **not** the Pi. A full pack is about 8.4 V (7.4 V nominal), and the L298N loses roughly 2 V inside, so the motor gets a little over 6 V.

> [!warn] **Danger: lithium batteries can overheat, smoke, burn and even explode.** Touching the two wires together is a short circuit that can start a fire in seconds. Wire with the battery **disconnected** and connect it **last**, never swap + and -, and never leave bare ends loose or a charging pack unattended or puncture or crush it. If it gets hot, smells, hisses, smokes or swells, **stop at once**, move it away from anything flammable and do not use or charge it again.

| Step | Wire | Goes into |
|---|---|---|
| 1 | Battery **-** (black) | driver `GND` |
| 2 | Pi `GND` | the same driver `GND` (joins the grounds) |
| 3 | Motor wires | driver `OUT1` and `OUT2` |
| 4 | Pi `GPIO13`, `GPIO18`, `GPIO12` | driver `ENA`, `IN1`, `IN2` |
| 5 | Battery **+** (red), through a switch or fuse | driver motor power terminal (often marked `+12V`) |

```widget
motorwiring
```

### Before you power on

- Take the small jumper cap off `ENA`, or PWM cannot slow the motor.
- Power the Pi from its own USB-C supply, and never join the driver's `+5V` to the Pi's 5V pin.
- Charge the pack only with a charger made for it, keep it above about 6 V (3 V per cell), and keep the motor's current, including when it stalls, within the L298N's limit of about 2 A per channel.

### The code

The pins are the same as on Arduino, and only the PWM call differs.

```python
import RPi.GPIO as GPIO
import time

IN1, IN2, ENA = 18, 12, 13

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)                 # init: hide "channel already in use" warnings
GPIO.setup([ENA, IN1, IN2], GPIO.OUT)   # init: all three are outputs
pwm_motor = GPIO.PWM(ENA, 1000)         # init: speed pin at 1000 Hz
pwm_motor.start(0)                      # init: start stopped

try:
    GPIO.output(IN1, GPIO.HIGH)         # IN1
    GPIO.output(IN2, GPIO.LOW)          # IN2: forward
    pwm_motor.ChangeDutyCycle(40)       # ENA speed, 0-100
    time.sleep(3)                       # run for 3 seconds

    GPIO.output(IN1, GPIO.LOW)          # IN1 and IN2 match: stop
    pwm_motor.ChangeDutyCycle(0)
except KeyboardInterrupt:
    print("\nStopped by user.")            # Ctrl+C lands here
finally:
    pwm_motor.stop()                       # stop the motor first, then release the pins
    GPIO.cleanup()                         # always runs, releases the pins
```

```cpp
void setup() {
  pinMode(18, OUTPUT);          // IN1
  pinMode(12, OUTPUT);          // IN2
  pinMode(13, OUTPUT);          // ENA
}
void loop() {
  digitalWrite(18, HIGH);       // IN1
  digitalWrite(12, LOW);        // IN2: forward
  analogWrite(13, 100);         // ENA speed, 0-255
}
```

> [!more] TLDR: the two motor exercises in the course
> In `motor_buttons.py` two buttons drive it: forward on `GPIO19` and backward on `GPIO26`, with the internal pull-up, and the motor stops when you let go. In `motor_cmd.py` you type commands: `F` forward, `B` backward, `S` stop, and `+` or `-` to change the speed by 10%.

## Servo: signal `GPIO18`

Arduino's `Servo` library takes an angle. On the Pi you turn the angle into a duty cycle yourself.

```python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)        # init: the signal pin is an output
servo = GPIO.PWM(18, 50)        # init: 50 Hz, the rate every hobby servo expects
servo.start(0)                  # init: no pulses yet, so the arm does not jump

try:
    while True:
        for angle in (0, 90, 180, 90):                 # sweep 0-180 degrees
            servo.ChangeDutyCycle(2 + angle / 18.0)    # angle 0-180 -> duty 2-12 %
            time.sleep(1)
except KeyboardInterrupt:
    print("\nStopped by user.")            # Ctrl+C lands here
finally:
    servo.stop()                           # stop the pulses before cleanup
    GPIO.cleanup()                         # always runs, releases the pins
```

```cpp
#include <Servo.h>
Servo servo;                    // create the object
void setup() {
  servo.attach(18);             // init: bind it to the pin
}
void loop() {
  servo.write(angle);           // 0-180 directly
}
```

## Push button: `GPIO23` to GND with the pull-up

```python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(23, GPIO.IN, pull_up_down=GPIO.PUD_UP)   # init: input with pull-up

try:
    while True:
        pressed = GPIO.input(23) == GPIO.LOW        # pressed reads LOW
        print("pressed" if pressed else "released")
        time.sleep(0.2)
except KeyboardInterrupt:
    print("\nStopped by user.")            # Ctrl+C lands here
finally:
    GPIO.cleanup()                         # always runs, releases the pins
```

```cpp
void setup() {
  pinMode(23, INPUT_PULLUP);    // init
}
void loop() {
  bool pressed = digitalRead(23) == LOW;
}
```

The pull-up works the same way in both. The difference is that the Pi sets it as an argument of `setup`.

## Ultrasonic sensor: Trig `GPIO23`, Echo `GPIO24`

> [!warn] Do not forget `import time`. The ultrasonic code uses `time.sleep` and `time.time()` all the time, and without the import it stops with `NameError: name 'time' is not defined`. Put `import RPi.GPIO as GPIO` and `import time` at the top.

This is where Python is more work. The sensor works in three steps: a 10 microsecond pulse on **Trig** tells it to send out a burst of ultrasound, then the **Echo** pin goes HIGH and stays HIGH for exactly as long as the sound takes to travel to the object and back. The distance is hidden in how long Echo stays HIGH. Arduino has `pulseIn`, which measures that HIGH time for you in one call. On the Pi there is no such call, so you time it yourself with the clock: note the moment Echo goes HIGH, note the moment it drops LOW, and subtract.

```python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(23, GPIO.OUT)                                             # init: Trig is an output
GPIO.setup(24, GPIO.IN)                                              # init: Echo is an input
GPIO.output(23, False)                                               # init: Trig starts LOW
time.sleep(0.5)                                                      # init: let the sensor settle

try:
    while True:
        GPIO.output(23, True); time.sleep(0.00001); GPIO.output(23, False)   # 10 microsecond ping
        pulse_start = pulse_end = time.time()
        while GPIO.input(24) == 0: pulse_start = time.time()         # echo begins
        while GPIO.input(24) == 1: pulse_end = time.time()           # echo ends
        speed_cm = (331 + 0.6 * 25) * 100                            # speed of sound in cm/s at 25 degrees C
        distance = (pulse_end - pulse_start) * speed_cm / 2          # cm, halved: there and back
        print(f"{distance:.1f} cm")
        time.sleep(0.5)
except KeyboardInterrupt:
    print("\nStopped by user.")            # Ctrl+C lands here
finally:
    GPIO.cleanup()                         # always runs, releases the pins
```

```cpp
void setup() {
  pinMode(23, OUTPUT);                      // init: Trig
  pinMode(24, INPUT);                       // init: Echo
}
void loop() {
  digitalWrite(23, HIGH); delayMicroseconds(10); digitalWrite(23, LOW);
  long duration = pulseIn(24, HIGH);        // times the echo for you, in microseconds
  float distance = duration * 0.0343 / 2;   // cm, 0.0343 cm per microsecond is about 20 degrees C
}
```

> [!tip] **The room temperature changes the answer.** Sound travels faster in warm air and slower in cold air: about `331 + 0.6 x temperature` metres per second, with the temperature in degrees C. The course code uses 25 degrees C, which is 346 m/s. In a much colder or hotter room the distance will drift, so change the `25` to the real room temperature if you need accurate readings.

## 16x2 LCD over I2C: `SDA` `GPIO2`, `SCL` `GPIO3`

The LCD needs a library that is not part of the `requirements.txt` set: install it inside the venv with `pip install rpi_lcd`, and switch on I2C first. The Environment chapter lists the package for every part. If `i2cdetect` shows a different address, or your screen is 16x2 and the text wraps oddly, pass the settings in: `LCD(address=0x3F, width=16, rows=2)`.

```python
from rpi_lcd import LCD
import time

lcd = LCD()                     # init: I2C bus 1, address 0x27 (I2C pins GPIO2 and GPIO3 are fixed, so no setmode)

try:
    count = 0
    while True:
        lcd.text(f"Count: {count}", 1)      # text, line number (starts at 1)
        count += 1
        time.sleep(1)
except KeyboardInterrupt:
    print("\nStopped by user.")            # Ctrl+C lands here
finally:
    lcd.clear()                            # always runs, blanks the screen
```

```cpp
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27, 16, 2);   // address, columns, rows
void setup() {
  lcd.init();                   // init: start the screen
  lcd.backlight();              // init: switch the light on
}
void loop() {
  lcd.setCursor(0, 1);          // column, row (starts at 0)
  lcd.print("Count: 5");
}
```

Note the counting: the Pi's `lcd.text` lines start at **1**, Arduino's `setCursor` rows start at **0**.

## Try it

1. A button wired to ground reads 1 when released and 0 when pressed. Why?
2. Why does an LED need a resistor, and what is used here?
3. Which part is easier on Arduino because of `pulseIn`, and what do you do instead on the Pi?
4. Why does the motor need its own power supply and a shared ground? What happens to the motor if `IN1` and `IN2` are both LOW?
5. A motor runs forward but never backward. What is the first thing you check in the code?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Pull-up | A spring holding a door shut | Keeps an input HIGH until a button pulls it LOW |
| PWM and duty cycle | Flicking a switch so fast it looks half on | Brightness, speed, servo angle |
| Resistor | A tap that limits the flow | Protects the LED and the pin |
| `pulseIn` vs a timing loop | A stopwatch built in vs one you hold yourself | Arduino times the echo for you, the Pi does not |
| L298N driver | A crane with its own engine | Lets weak pins control a strong motor |
| `IN1`, `IN2` | The up and down lever | Match: stop. Crossed: forward or backward |
| `ENA` + PWM | The accelerator | Sets the motor speed |
