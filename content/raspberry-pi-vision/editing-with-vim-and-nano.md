---
title: Editing with vim and nano
summary: Two text editors that work in the terminal, one easy and one powerful, for when there is no VS Code.
---

> [!aha] Sooner or later you will be on the Pi with only a terminal and a file to fix. **nano** works like a normal editor, with the keys listed along the bottom. **vim** is stranger, because it has modes, but it is on almost every Linux machine and very quick once you know four keys.

## nano: the easy one

Open or create a file with `nano filename`. Type as you would in any editor. The shortcuts are shown along the bottom of the screen, where `^` means Ctrl. If you only remember one editor, make it nano.

| Keys | What it does |
|---|---|
| `Ctrl+O`, then Enter | Save ("write Out") |
| `Ctrl+X` | Exit. It asks to save first if you have unsaved changes |
| `Ctrl+W` | Search |
| `Ctrl+K` | Cut the current line |
| `Ctrl+U` | Paste it back |

```bash
nano blink.py
```

## vim: the powerful one

The surprise in vim is that **keys do different things depending on the mode**. When you open a file, typing letters does not type letters. It runs commands. That is the part that confuses everybody. Click through the three modes to see the keys for each.

```widget
vimmodes
```

> [!compare] Think of it like a car with gears. In Normal mode the keys are the steering wheel and pedals, they control the editor. In Insert mode you are parked and writing a letter. You press `Esc` to shift back into driving, and you type `:` to use the dashboard.

### The shortest way to survive

```text
vim file.py     open the file
i               go into Insert mode, now type your changes
Esc             back to Normal mode
:wq   Enter     save and quit
:q!   Enter     quit and throw away changes
```

> [!warn] If you ever feel stuck in vim and nothing works, press `Esc` a couple of times, then type `:q!` and press Enter. That gets you out without saving.

## Which one when?

| Situation | Pick |
|---|---|
| A quick fix, and you want it to just work | nano |
| Long edits, moving lines around, searching a big file | vim |
| A lot of editing in a comfortable window | VS Code Remote, from the earlier chapter |

## Try it

1. What does `Ctrl+O` do in nano, and how is it different from `Ctrl+X`?
2. You open a file in vim and typing letters does something odd. Which mode are you in, and how do you start typing text?
3. What are the keys to save and quit in vim, and to quit without saving?
4. Which editor would you pick for a one-line fix, and why?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| nano | A notepad | A simple editor with the shortcuts shown |
| vim | A car with gears | An editor with modes, quick once you know the keys |
| Normal mode | Driving | Keys are commands |
| Insert mode | Parked, writing a letter | Keys type text |
| `:wq` / `:q!` | Save and leave / leave without saving | The two exits to know |
