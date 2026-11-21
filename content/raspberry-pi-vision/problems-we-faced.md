---
title: Problems we faced
summary: The errors you will actually meet on the Pi, what causes each one, and the fix that worked.
---

> [!aha] Almost every Pi error comes from one of four causes: the **wrong environment**, **no display**, the **camera is busy or missing**, or a **switched-off interface**. Match the message to the cause and the fix is usually one line.

## The four families

| Family | Typical messages | The cause in one sentence |
|---|---|---|
| Wrong environment | `No module named 'cv2'`, `'ultralytics'`, `'rpi_lcd'`, `externally-managed-environment`, `Python.h` | You are not in the environment where the packages live |
| No display | `qt.qpa.xcb: could not connect to display`, then `Aborted` | A window is opened with no screen to put it on |
| Camera | `Could not open camera device at index 0`, `No cameras available!` | No camera, or another program has it |
| Interface off | `i2cdetect` shows an empty grid | I2C is not enabled, or the wiring is wrong |

## What each fix looks like

**Wrong environment.** Activate the project's virtual environment first, then install or run:

```bash
source venv/bin/activate
pip install rpi_lcd
```

Prefer fixing the root cause, not forcing it. `--break-system-packages` switches off the safety check, so only use it when you really mean to change the system Python.

**No display.** Prefix the command with `DISPLAY=:0`, and keep a screen-share or VNC window open so the picture has somewhere to appear:

```bash
DISPLAY=:0 python3 w7b.py
```

Or remove the `cv.imshow` and `cv.waitKey` calls and run headless.

**Camera busy.** Find who holds it and free it:

```bash
lsusb
ls /dev/video*
fuser /dev/video0
kill <pid>
```

**I2C empty grid.** Switch I2C on, reboot, and check the bus and the wiring:

```bash
sudo raspi-config        # Interface Options, I2C, Enable
sudo reboot
ls /dev/i2c*
sudo i2cdetect -y 1
```

## Two that look like bugs but are not

| What you see | Why |
|---|---|
| A servo goes limp after the script ends | `servo.stop()` and `GPIO.cleanup()` stop the PWM pulses, so nothing is holding the arm. Remove them at the end if you want it to hold its last position |
| `TypeError: unsupported operand type(s) for &: 'NoneType' and 'int'` after "Done" | A harmless double cleanup: the PWM object tries to stop its channel again after `GPIO.cleanup()`. It is cosmetic and safe to ignore |

> [!compare] Think of it like a doctor reading symptoms. A cough can come from a dozen causes, but there are only a few common ones. You rule out the common ones first: "Is the right environment on? Is there a screen? Is the camera free?" Most of the time, one of those is the answer.

## Prevent them

- Run `./setup.sh` once, and always `source venv/bin/activate` before running anything.
- Pick the right interpreter in VS Code so imports are not underlined red for no reason.
- End GPIO scripts with `try` / `except KeyboardInterrupt` / `finally: GPIO.cleanup()`.
- Close the previous run of a camera script before starting the next one.

## Try it

1. Your script prints `qt.qpa.xcb: could not connect to display` and then `Aborted`. How many separate problems is that, and what is the fix?
2. `No module named 'ultralytics'` but you installed it yesterday. What is the most likely cause?
3. How do you find the process that is holding the camera, and then stop it?
4. A servo drops limp when your script ends. Is that a bug, and how would you change it?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `source venv/bin/activate` | Opening the right lunchbox | Fixes most "module not found" errors |
| `DISPLAY=:0` | Pointing at the right screen | Fixes the Qt display error |
| `fuser`, `kill` | Finding and stopping the one hogging the camera | Frees a busy camera |
| `raspi-config` | The Pi's control panel | Switches on I2C and other interfaces |
| `finally: GPIO.cleanup()` | Always putting the tools away | Releases the pins however the script ends |
