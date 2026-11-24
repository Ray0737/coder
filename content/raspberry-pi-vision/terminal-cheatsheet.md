---
title: Terminal cheatsheet
summary: The handful of Linux commands you will actually use on the Pi, grouped by what you are trying to do.
---

> [!aha] The terminal is just a conversation: you type a command, it runs, and it prints an answer. You do not need hundreds of commands. About twenty cover almost everything in this course.

## Moving around and looking

| Command | What it does |
|---|---|
| `pwd` | Print where you are (the working directory) |
| `ls` | List the files here. `ls -l` shows details |
| `cd folder` | Go into a folder. `cd ..` goes up, `cd` alone goes home |
| `mkdir name` | Make a new folder |
| `cat file` | Print a file's contents |
| `nano file` | Open a file in the nano editor |

## Copying, moving and removing

| Command | What it does |
|---|---|
| `cp a b` | Copy `a` to `b` |
| `mv a b` | Move or rename `a` to `b` |
| `rm file` | Delete a file, with no recycle bin |

> [!warn] `rm` is permanent. There is no undo and no trash. Check the file name before you press Enter.

> [!warn] **Never run `sudo rm -rf /`, or any `rm -rf` with `/`, `/*` or `~` in it.** `rm -r` deletes a folder and everything inside it, `-f` switches off every "are you sure?" question, and `sudo` runs it as the administrator, so nothing stops it. Pointed at `/`, it wipes the whole system: the OS, your code and your files, and the Pi will not boot again. The only fix is to flash the card again. A tiny typo, such as a stray space in `rm -rf /home/pi/project`, can turn a safe command into this one, so read the whole line before you press Enter. Be just as careful with any command you copy from a website or a chat.

| Safer habit | Why |
|---|---|
| Run `ls` on the path first | You see exactly what `rm` would delete |
| Use `rm -r folder` without `-f` | You still get asked before each deletion |
| Avoid `sudo` unless the command needs it | A mistake without `sudo` can only touch your own files |

## Installing things

| Command | What it does |
|---|---|
| `sudo` | Run the next command as the administrator |
| `sudo apt update` | Refresh the list of available packages |
| `sudo apt upgrade` | Install newer versions of what you have |
| `sudo apt install name` | Install a system package |
| `pip install name` | Install a Python package. Do this inside a venv |

## Looking at the hardware

These are the commands your README uses to check that the Pi can see its parts:

| Command | What it tells you |
|---|---|
| `lsusb` | The USB devices connected, such as a webcam |
| `ls /dev/video*` | Whether a camera exists as `/dev/video0` |
| `ls /dev/i2c*` | Whether the I2C bus exists (`/dev/i2c-1`) |
| `sudo i2cdetect -y 1` | The I2C addresses of connected devices, such as the LCD at `27` |
| `rpicam-hello --list-cameras` | Whether a ribbon camera is detected |
| `free -h` | How much memory you have and use |

## Dealing with a stuck program

| Command | What it does |
|---|---|
| `Ctrl+C` | Stop the program that is running in the terminal |
| `fuser /dev/video0` | Show which process is holding the camera |
| `kill <pid>` | Stop that process, so the camera is free again |

`Ctrl+C` is not the same as quitting. It stops the program, and the `finally` block in your scripts runs, so `GPIO.cleanup()` frees the pins.

## Running a script

```bash
source venv/bin/activate    # the prompt now starts with (venv)
python3 hand_servo.py
DISPLAY=:0 python3 hand_servo.py     # same, but windows go to the Pi's screen
deactivate                   # leave the venv when done
```

> [!compare] Think of it like a kitchen. The commands are the tools on the wall: `ls` is looking in the cupboards, `cp` and `mv` move things around, `sudo apt install` is fetching from the shop, and `kill` is turning off a hob someone forgot.

## Try it

1. Which command shows what is plugged into the USB ports?
2. Your camera script says the device is busy. Which two commands find and stop whatever is holding it?
3. What is the difference between `cp` and `mv`?
4. Why does `Ctrl+C` leave the GPIO pins in a clean state when your script uses `try`/`finally`?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `ls`, `cd`, `pwd` | Looking round the rooms of a house | Show and move between folders |
| `sudo` | A master key | Runs a command as the administrator |
| `apt` | The shop for system software | Installs system packages |
| `lsusb`, `i2cdetect` | A roll call | Lists connected hardware |
| `fuser`, `kill` | Finding and switching off a stuck hob | Frees something a program is holding |
