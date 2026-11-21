---
title: Environment
summary: Keep each project's Python and packages in their own box, so installing one thing never breaks another.
---

> [!aha] "It works on my Pi" usually means "the right Python and the right package versions were active". A **virtual environment** is a private box of packages for one project. Turn the box on, and you get exactly the versions that are known to work.

## Why an environment

The Pi has a Python that the operating system itself depends on. Installing packages straight into it can break system tools, so recent Debian systems refuse to let you:

```text
error: externally-managed-environment
```

This is on purpose (it is called PEP 668). The fix is not to force it, but to work inside an environment of your own.

> [!compare] Think of it like a lunchbox per project. You pack exactly what each one needs, and nothing leaks into the school bag, which is the system Python. Open the wrong box and you find the wrong sandwich: the wrong version of a library.

## What your folder pins

Your `Code - Raspi` folder is set up around **Python 3.11.9**, managed with `pyenv`, and these exact versions:

| Package | Version | Used for |
|---|---|---|
| `numpy` | 2.4.6 | Arrays: every image is one |
| `opencv-python` | 5.0.0.93 | Camera, drawing, display |
| `mediapipe` | 0.10.9 | Hand tracking |
| `RPi.GPIO` | 0.7.1 | Pins and PWM |

These are listed in `requirements.txt`. The Python version matters because `mediapipe==0.10.9` has a prebuilt file (a wheel) for Python 3.11 on the 64-bit Pi. On another Python version pip may try to build it from source, which is slow and often fails with `fatal error: Python.h: No such file or directory`.

## One command to set up

```bash
./setup.sh
```

The script checks that you have Python 3.11.x, creates `venv/` if it is missing, installs everything from `requirements.txt`, and finally checks that `cv2`, `mediapipe`, `numpy` and `RPi.GPIO` all import. It is safe to run again, because it reuses the environment instead of rebuilding it.

## Or by hand

```bash
pyenv install 3.11.9        # skip if you already have it
pyenv local 3.11.9          # writes .python-version in this folder

python3 -m venv venv
source venv/bin/activate    # the prompt now starts with (venv)

pip install --upgrade pip
pip install -r requirements.txt
```

Check it with:

```bash
python3 -c "import cv2, mediapipe, numpy, RPi.GPIO; print('all good')"
```

Leave the environment with `deactivate`.

## Packages for each part

`requirements.txt` only covers the core four. Some parts need one more package before their code will run, and it is easy to forget. There are two kinds of install, and they are not interchangeable:

| Install with | For | Example |
|---|---|---|
| `pip install` (inside the venv) | Python libraries your code imports | `rpi_lcd`, `ultralytics` |
| `sudo apt install` | System tools and files | `i2c-tools`, `python3-dev` |

| Part | What you need | How |
|---|---|---|
| LED, buttons, ultrasonic, motor driver, servo | `RPi.GPIO` | Already in `requirements.txt` |
| 16x2 I2C LCD | `rpi_lcd` (it pulls in `smbus` by itself) | `pip install rpi_lcd`, and enable I2C in `sudo raspi-config` (see the next section) |
| Checking the LCD address | The `i2cdetect` command, from `i2c-tools` | `sudo apt install i2c-tools`, then `sudo i2cdetect -y 1` |
| Webcam and drawing | `opencv-python` | Already in `requirements.txt` |
| Hand tracking | `mediapipe==0.10.9`, plus the `hand_landmarker.task` file | Already in `requirements.txt`, and keep the file next to the script |
| YOLO detection | `ultralytics` | `pip install ultralytics` |
| Exporting a lighter YOLO model | `ncnn`, `onnx`, `onnxsim` | `pip install ncnn onnx onnxsim` |
| A package that tries to compile and fails with `Python.h` | Python's C headers | `sudo apt install python3-dev` |

> [!warn] Activate the venv before every `pip install`, or the package lands in the wrong place and your script says `No module named ...`. `sudo apt install` does not need the venv, because it installs for the whole system.

The `i2c-tools` line is the one your README does not spell out: it uses `i2cdetect` but never says where the command comes from. If the command is not found, that package is what is missing.

## Switching on interfaces: `raspi-config`

A few parts talk to the Pi through a built-in interface that is **switched off by default**, so installing the library is not enough. You switch interfaces on in the Pi's settings tool, `raspi-config`, which needs `sudo`:

```bash
sudo raspi-config        # Interface Options, then the interface you need, then Enable
sudo reboot              # the change only takes effect after a reboot
```

Move around its menu with the arrow keys, Enter to choose and Tab to reach Select and Finish. Which parts need which interface:

| Part | Interface to enable | How to check it worked |
|---|---|---|
| 16x2 I2C LCD | **I2C** | `ls /dev/i2c*` shows `/dev/i2c-1`, and `sudo i2cdetect -y 1` shows the LCD's address (for example `27`) |
| Controlling the Pi from another computer | **SSH** | `ssh <user>@<host>.local` connects. If you set it in the Imager it is already on |
| LED, buttons, ultrasonic sensor, motor driver, servo | Nothing | GPIO works straight away, and so does PWM from `RPi.GPIO` |
| USB webcam | Nothing | `ls /dev/video*` shows `/dev/video0` |
| Ribbon (CSI) camera | Usually nothing on a recent Raspberry Pi OS | `rpicam-hello --list-cameras` lists it |

> [!warn] If `i2cdetect` shows an empty grid, the usual cause is that I2C is still off, or the Pi was not rebooted after turning it on. Your README also suggests `lsmod | grep i2c_`, which should list `i2c_dev` and `i2c_bcm2835` once the interface is on.

The course only needs I2C switched on, and only for the LCD. The other interfaces in the menu, such as SPI and the serial port, are not used by any script here.

## Which one am I in?

Your folder has more than one environment: `venv/`, an older `env/` built on the system Python 3.13, and the pyenv shim. They do not share packages. Two quick checks tell you where you are:

| Check | What it shows |
|---|---|
| The prompt starts with `(venv)` | The environment is active |
| `pip show <package>` | Whether the package exists in the *active* environment |

> [!warn] If you see `ModuleNotFoundError: No module named 'ultralytics'` even though you installed it, you are almost certainly in the wrong environment. Run `source venv/bin/activate` and try again.

The same applies in VS Code. If `cv2` is underlined red but works in the terminal, choose the right interpreter with **Python: Select Interpreter**.

## Try it

1. Why does Debian refuse `pip install` straight into the system Python?
2. Why is Python 3.11 specified, and not whatever is newest?
3. How do you tell from the prompt that the environment is on?
4. A package is "not found" although you installed it yesterday. What is the most likely reason?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Virtual environment | A lunchbox for one project | Keeps that project's packages separate |
| `requirements.txt` | The packing list | Pins the exact versions that work |
| `pyenv` | A cupboard of Python versions | Picks the Python for a folder |
| `setup.sh` | A packing assistant | Builds the box and checks it is complete |
| `(venv)` in the prompt | The lunchbox lid is open | The environment is active |
