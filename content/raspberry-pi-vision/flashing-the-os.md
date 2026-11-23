---
title: Flashing the OS
summary: Put an operating system on a microSD card, so the Pi has something to boot.
---

> [!aha] A Pi has no built-in system. The microSD card **is** its hard drive, so "setting up a Pi" starts with writing an operating system onto that card from another computer. That is called **flashing**.

## What you need

| Item | Why |
|---|---|
| A microSD card | Becomes the Pi's drive. Everything on it is erased |
| A card reader | To plug the card into your computer |
| A computer with Raspberry Pi Imager | The free tool that writes the card |
| A power supply for the Pi | USB-C, 5 volts |

Your folder's reference build is **Debian GNU/Linux 13 (trixie)**, the 64-bit (aarch64) Raspberry Pi system. It uses the `labwc` desktop on Wayland. Choose the 64-bit Raspberry Pi OS in the Imager so you match it.

## Steps

1. Install **Raspberry Pi Imager** on your computer and open it.
2. Choose your **Pi model** (Raspberry Pi 4).
3. Choose the **operating system**: Raspberry Pi OS, 64-bit.
4. Choose the **storage**: your microSD card. Check carefully, because it will be wiped.
5. When asked about customisation, set the **hostname**, a **username and password**, your **Wi-Fi**, and turn on **SSH**. Doing it now means you can connect without ever plugging in a screen.
6. Write the card and wait for it to verify.
7. Put the card into the Pi, connect power, and give it a minute or two to boot the first time.

> [!compare] Think of it like installing a brand-new operating system on a laptop, but through a card instead of a USB stick, and with your name and Wi-Fi password written in before it ever starts. The first boot then just does the rest on its own.

## Check it worked

Once the Pi is on your network you can find it by the hostname you chose. From another computer, try the command below: if it asks for a password and then shows a command prompt, the flash worked. The next chapter covers connecting properly, with a screen or without.

```bash
ssh <username>@<hostname>.local
```

## Two settings worth knowing

| Setting | Why |
|---|---|
| SSH on | Lets you control the Pi from another computer, with no monitor or keyboard on it |
| A strong password | The Pi may be reachable from your whole network, so do not leave the default |

I2C is **off** by default and is turned on later with `sudo raspi-config`, under Interface Options. You only need it for the LCD.

## Try it

1. Why does the microSD card lose everything when you flash it?
2. Why is it useful to set Wi-Fi and SSH in the Imager and not afterwards?
3. How do you check from another computer that the flashed Pi is reachable?
4. Which interface do you still have to switch on later, and for which part?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Raspberry Pi Imager | A tool that writes a card | Puts the OS onto the microSD |
| microSD | The Pi's only drive | Holds the OS and your files |
| Hostname | The Pi's name on the network | Lets you reach it as `name.local` |
| SSH setting | A key to the door | Lets you log in from another computer |
| First boot | Moving in and unpacking | The Pi finishes setting itself up |
