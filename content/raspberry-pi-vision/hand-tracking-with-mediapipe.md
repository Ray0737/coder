---
title: Hand tracking with MediaPipe
summary: Find 21 points on a hand in the webcam, then turn one fingertip's position into a real servo angle on the Pi.
---

> [!aha] MediaPipe turns a hand into 21 numbered points. Once you have a point, "where is the fingertip?" is just two numbers, and any two numbers can drive something: a colour picker, a cursor, or a servo motor.

## 21 landmarks per hand

**MediaPipe**'s hand model returns 21 landmarks per detected hand, each with an (x, y, z) position. Number 0 is the wrist, then four joints per finger running out to the tips. The one you will use most is **landmark 8, the index fingertip**, the natural "pointing" spot. Drag the fingertip below and watch the servo follow.

```widget
handlandmarks
```

The x and y come back **normalised**: fractions from 0 to 1 of the frame's width and height, not pixels. To get a pixel position, multiply by the frame size: `int(tip.x * width)`.

> [!compare] Think of it like marking a hand on a map with 21 pins. You do not describe the hand, you just read off where pin number 8 is. Move your finger and the pin moves with it.

## Setup on the Pi

Your `Code - Raspi` folder pins everything that is known to work on the Pi 4 (Debian 13, 64-bit, Python 3.11):

| Package | Version | Why |
|---|---|---|
| `mediapipe` | 0.10.9 | Has a prebuilt wheel for Python 3.11 on 64-bit Pi, so no long build |
| `opencv-python` | 5.0.0.93 | Camera, drawing and display |
| `numpy` | 2.4.6 | Arrays |
| `RPi.GPIO` | 0.7.1 | PWM for the servo |

Run `./setup.sh` to build the virtual environment, and keep `hand_landmarker.task` (the model file) next to the script. `mediapipe` is picky about the Python version, so stay on 3.11 unless you have checked that a wheel exists.

## Two APIs: know which one you have

| | Old API | New Tasks API (used in `w6.py`) |
|---|---|---|
| Versions | `mediapipe` older than 0.10.30 | Also available in 0.10.9 as `mp.tasks` |
| How | `mp.solutions.hands` | `HandLandmarker` with a model file |
| Model | Built in | Needs `hand_landmarker.task` |
| Call | `hands.process(rgb_frame)` | `landmarker.detect_for_video(mp_image, timestamp_ms)` |
| Tip | `results.multi_hand_landmarks[...].landmark[8]` | `result.hand_landmarks[0][8]` |

> [!warn] MediaPipe wants **RGB** frames, but OpenCV gives BGR. Convert first: `rgb = cv.cvtColor(frame, cv.COLOR_BGR2RGB)`. In video mode the timestamp you pass, in milliseconds, must go up on every call.

## The servo pointer (`w6.py`)

The exercise tracks the index fingertip and maps its **horizontal position** to a servo angle from 0 to 180 degrees, so the servo points wherever your finger is in the frame.

| Servo wire | Goes to |
|---|---|
| Signal (orange or yellow) | GPIO18 |
| Power (red) | 5V, from an external supply if the servo draws more than the Pi can spare |
| Ground (brown or black) | Pi GND |

```python
import time, cv2 as cv, mediapipe as mp, RPi.GPIO as GPIO

SERVO_PIN, MODEL_PATH, INDEX_FINGERTIP = 18, "hand_landmarker.task", 8

GPIO.setmode(GPIO.BCM)
GPIO.setup(SERVO_PIN, GPIO.OUT)
servo = GPIO.PWM(SERVO_PIN, 50)          # 50 Hz is the servo's refresh rate
servo.start(0)

options = mp.tasks.vision.HandLandmarkerOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=mp.tasks.vision.RunningMode.VIDEO,
    num_hands=1,
    min_hand_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)
```

Inside the camera loop, the frame is **flipped** so the servo moves the way you expect (like a mirror), converted to RGB, and handed to the model:

```python
frame = cv.flip(frame, 1)                              # mirror view
frame_h, frame_w = frame.shape[:2]
rgb_frame = cv.cvtColor(frame, cv.COLOR_BGR2RGB)
mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
timestamp_ms = int((time.time() - start_time) * 1000)
result = landmarker.detect_for_video(mp_image, timestamp_ms)

if result.hand_landmarks:
    tip = result.hand_landmarks[0][INDEX_FINGERTIP]
    x, y = int(tip.x * frame_w), int(tip.y * frame_h)  # pixels

    angle = (x / frame_w) * 180                        # 0 to 180 degrees
    duty = 2 + (angle / 18.0)                          # degrees -> duty cycle %
    servo.ChangeDutyCycle(duty)
```

## From an angle to a duty cycle

A hobby servo reads the **width of a pulse** that repeats 50 times a second. A short pulse means 0 degrees and a long one means 180. With `GPIO.PWM` you set the pulse width as a percentage of each 20 ms period, called the **duty cycle**. The line `duty = 2 + angle / 18` maps the angle onto that range: 0 degrees gives 2%, 90 degrees gives 7% and 180 degrees gives 12%.

> [!compare] Think of it like a dimmer dial and a clock. The servo does not read "90 degrees" as a number. It measures how long the signal stays high within each tick, and turns its arm to match.

Always clean up on the way out, or the servo can keep twitching and the pin stays claimed:

```python
finally:
    cap.release()
    cv.destroyAllWindows()
    servo.stop()
    GPIO.cleanup()
```

## Picking a colour with the fingertip

The same fingertip can also read **colour**. `calibrate_colors.py` shows how to make a colour target list: hold a coloured paper square in the middle of the frame, average a small patch of pixels, and print the result.

```python
PATCH = 30                                   # half-size of the sampling box
patch = frame[cy - PATCH:cy + PATCH, cx - PATCH:cx + PATCH]
b, g, r = np.mean(patch, axis=(0, 1))        # average colour of the patch
```

Averaging a patch, not a single pixel, makes the reading steady against noise. `hand_tracking_color_to_servo.py` in the Computer Vision folder uses this idea: sample the colour under the fingertip, match it to the nearest target in a palette, and point the servo at the matching angle.

## Speed: skip frames

Running the model on every frame is slow on a small computer. Process only every third frame, and **reuse the last result** to draw on the frames you skipped:

```python
if frame_count % (SKIP_FACTOR + 1) == 0:
    last_results = hands.process(rgb_frame)
# draw using last_results on every frame, new or not
```

A hand cannot move far in a thirtieth of a second, so the drawing still looks smooth while the processing load drops by about two thirds.

## Try it

1. Landmark 8 reports `tip.x = 0.25` on a 640-pixel-wide frame. What pixel is that, and what servo angle does `(x / frame_w) * 180` give?
2. What duty cycle does the servo get for 90 degrees?
3. Why does the script flip the frame with `cv.flip(frame, 1)` before reading the finger?
4. What goes wrong if you hand a raw OpenCV frame to MediaPipe without converting it?
5. Why is it fine to reuse the last result for two frames out of three?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Landmark | A numbered pin on a map of the hand | One tracked point, in 0 to 1 coordinates |
| Landmark 8 | The pin on the index fingertip | The usual "pointing" point |
| Normalised coordinates | Distance as a fraction of the page | Multiply by the frame size to get pixels |
| Duty cycle | How long a switch stays on in each tick | Sets the servo angle: `2 + angle / 18` |
| `cv.flip(frame, 1)` | Looking in a mirror | Makes left and right feel natural |
| Frame skipping | Glancing every third second | Reuses the last result to save computing |
