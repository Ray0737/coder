---
title: The board and its ports
summary: A tour of the Raspberry Pi 4 board: the chips in the middle and every port and connector around the edge.
---

> [!aha] A Raspberry Pi is a complete computer on one small board. The processor, memory, networking and video are all there. What it does not come with is a hard drive, a power supply or a screen, so those are the ports around the edge.

## A computer on a card

Your course uses a **Raspberry Pi 4**. Its main chip is a Broadcom **BCM2711**: four 64-bit ARM Cortex-A72 processor cores and the graphics, in one package. Next to it sits the RAM, and a wireless chip with dual-band Wi-Fi and Bluetooth 5.0. It is a real computer, but a small and low-powered one, which is why later chapters shrink the pictures and the model before running them. Click any part of the board below to see what it is for.

```widget
piboard
```

> [!compare] Think of it like a small flat with the front door in different places. The ports are the doors and windows: power comes in one door, video leaves through another, and the GPIO header is the big workshop door along the top where all the electronics come in.

> [!more] TLDR: it runs Linux
> Because it is a full computer, it runs a full operating system: **Linux**, and specifically **Debian**. The Raspberry Pi OS you flash onto the card is built on Debian, and your course folder was set up on Debian GNU/Linux 13 (trixie), 64-bit. That is why the commands in this course, such as `ls`, `sudo apt install` and `pip`, are ordinary Linux commands, and why the Pi behaves like a small Linux PC and not like a microcontroller running a single program.

## The ports

The table lists every connector on the board. These are the standard specifications for a Pi 4 Model B, and the amount of RAM depends on the model you have, so check the label or run `free -h` in the terminal.

| Port | Count | What it is for |
|---|---|---|
| USB-C power | 1 | Power in, at 5 volts. Use a proper supply, because a weak one makes the Pi throttle or reboot |
| micro-HDMI | 2 | Video out to a monitor. They need micro-HDMI to HDMI cables |
| USB 3.0 (blue) | 2 | Fast USB, good for a webcam or a drive |
| USB 2.0 (black) | 2 | Slower USB, fine for a keyboard and mouse |
| Gigabit Ethernet | 1 | A wired network connection |
| 3.5 mm audio and video jack | 1 | Headphones, or composite video |
| CSI connector | 1 | A flat ribbon for the Raspberry Pi camera module |
| DSI connector | 1 | A flat ribbon for the official touchscreen |
| microSD slot | 1 | The "hard drive". On the underside of the board |
| 40-pin GPIO header | 1 | The connection to LEDs, buttons, sensors, motors and the LCD |

## The one that matters most: GPIO

The **40-pin header** is what makes the Pi different from a normal computer. The next chapters wire real parts to it. Two ports matter for vision work:

- **USB**, for the webcam. The camera appears as `/dev/video0`, and OpenCV opens it with `cv.VideoCapture(0)`.
- **CSI**, if you use the ribbon camera instead. `rpicam-hello --list-cameras` tells you whether any camera is detected, and it says "No cameras available!" if neither a CSI nor a USB camera is found.

## Try it

1. Which port do you use to power the Pi, and what goes wrong with a weak supply?
2. Where does the operating system live, and where on the board is it?
3. Your webcam will not open. Which two commands from this chapter check whether the Pi can see it?
4. Why do you need a micro-HDMI to HDMI cable and not an ordinary HDMI one?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| BCM2711 | The brain of the flat | Four 64-bit cores and the graphics in one chip |
| microSD | A filing cabinet in the basement | Stores the OS and your files |
| USB-C | The mains socket | Brings 5 volt power in |
| micro-HDMI | A window to a monitor | Video out |
| USB 3.0 / 2.0 | Fast and slow side doors | Plug in a webcam, keyboard, mouse |
| GPIO header | The workshop door | Connects real electronics |
