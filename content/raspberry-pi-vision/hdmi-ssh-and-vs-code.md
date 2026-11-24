---
title: HDMI, SSH and VS Code
summary: Three ways to work on the Pi: a screen on its HDMI (High-Definition Multimedia Interface) port, a command line over SSH (Secure Shell), or VS Code over the network.
---

> [!aha] You do not have to sit at the Pi. Plug in a monitor, or log in over the network with **SSH**, and use VS Code on your own laptop to edit the Pi's files. The one catch is windows: a program that opens a picture needs a screen to open it on.

## Three ways in

| Way | You need | Good for |
|---|---|---|
| HDMI (High-Definition Multimedia Interface) | A monitor, keyboard and mouse plugged into the Pi | First setup, and seeing camera windows with no tricks |
| SSH (Secure Shell) | The Pi on the network, and a terminal on your computer | Running commands from anywhere |
| VS Code Remote | SSH working, plus VS Code on your computer | Editing the Pi's files in a comfortable editor |

### HDMI (High-Definition Multimedia Interface)

Connect a monitor to a **micro-HDMI** port with a micro-HDMI to HDMI cable, plus a keyboard and mouse. It is the easiest first step, and it is the only way a camera window simply works.

> [!warn] The Pi 4's video ports are the small **micro-HDMI** size, and an ordinary HDMI plug will not fit them. You need either a **micro-HDMI to HDMI cable**, or an **adapter** that turns the Pi's micro-HDMI port into a full-size HDMI socket, so your monitor's normal cable fits. Check you have one before setup day, because a monitor on its own is not enough.

### SSH (Secure Shell)

SSH opens a command line on the Pi from another computer. It asks for the password you set when you flashed the card, and everything you type then runs on the Pi, not on your laptop. When you type the password, **nothing appears on screen**, not even dots. That is normal, so just type it and press Enter. The first time you connect, SSH also asks whether to trust the Pi: type `yes`. If you see `Permission denied`, the username or the password is wrong, and remember the username is the Pi's one that you set when you flashed the card, not your laptop's.

```bash
ssh <pi-username>@<pi-ip-or-hostname>.local
```

> [!compare] Think of it like a phone call to the Pi. You hear and speak only through the command line. You cannot see the Pi's screen, but you can tell it to do anything a person at the keyboard could.

### When SSH will not connect, or drops

SSH travels over your network, so most SSH problems are network problems.

- **Same network:** your computer and the Pi must be on the **same network**, for example the same Wi-Fi or the same router. If one is on the school Wi-Fi and the other on your phone's hotspot, they cannot find each other.
- **The IP address can change:** the router hands out the Pi's address, and it can give it a new one after a restart. Check it on the Pi with `ifconfig` (or `hostname -I`), and check your own computer's address with `ipconfig` on Windows or `ifconfig` on Mac and Linux. The first three numbers of both addresses should match, like `192.168.1.x`. Using the name, `<hostname>.local`, instead of the number avoids chasing a changing address.
- **A crowded network can drop you:** when a lot of people are on the same network at once, such as a full classroom, the connection can slow down or cut out. You may be disconnected in the middle of a session. Reconnect, or move to a quieter network or a cable.

> [!warn] If SSH worked yesterday and says "connection timed out" or "no route to host" today, check the network first. The usual cause is a different network or a new IP address, not a broken Pi.

### VS Code Remote

With the **Remote - SSH** extension, VS Code on your laptop connects to the Pi and edits files that live on the Pi. The editor looks and feels local, but the files, the terminal and the running code are all on the Pi.

> [!more] TLDR: when VS Code will not add the Pi
> On some computers VS Code will not let you add the Pi from its "Add New SSH Host" box. When that happens, write the host into the SSH config file yourself. Press Ctrl+Shift+P, run **Remote-SSH: Open SSH Configuration File**, and pick your own config file (usually `.ssh/config` in your user folder). Then add an entry like this, where `User` is the **Pi's** username, not your laptop's:
>
> ```text
> Host pi
>     HostName <pi-ip-or-hostname>.local
>     User <pi-username>
> ```
>
> Save it, run **Remote-SSH: Connect to Host**, and choose `pi`.

## The catch: windows need a screen

A program that opens a picture with `cv.imshow()` needs a display to draw on, and over SSH there is none. Unless you fix it, you get the error below, followed by `Aborted (core dumped)`. The Aborted line is the same problem, not a second one: Qt cannot find a screen, so the whole process stops. The Pi still has a virtual desktop running as display `:0` even with no monitor, and there are two ways to look at it.

```text
qt.qpa.xcb: could not connect to display
```

| Option | How |
|---|---|
| **Raspberry Pi Connect** | Sign in at connect.raspberrypi.com, choose your Pi and click "Screen sharing". Then start the script with `DISPLAY=:0` in front of it |
| **VNC** | `wayvnc` is installed. This Pi runs the `labwc` Wayland desktop, so `wayvnc` is the right VNC, not RealVNC's X11 server |

```bash
DISPLAY=:0 python3 hand_servo.py
```

> [!more] TLDR: what DISPLAY=:0 does, and running headless
> The `DISPLAY=:0` tells the program which screen to use, and the screen-share or VNC window is how you actually see it. If you do not need to see the window, delete the `cv.imshow` and `cv.waitKey` calls and run headless instead.

## Try it

1. What is the difference between plugging in HDMI and using SSH?
2. A script works in the terminal on the Pi's desktop but fails over SSH with a Qt error. What is missing?
3. Which command shows a Pi window while you are logged in over SSH, and what must also be open?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| micro-HDMI (High-Definition Multimedia Interface) | A window straight onto the Pi's screen | Shows the Pi's own desktop |
| SSH (Secure Shell) | A phone call to the Pi | A remote command line |
| VS Code Remote | An editor on your desk, files at the Pi | Edits the Pi's files from your laptop |
| `DISPLAY=:0` | Telling the program which screen to use | Sends windows to the Pi's virtual desktop |
| Pi Connect / `wayvnc` | A TV showing the Pi's desktop | Lets you see windows when there is no monitor |
