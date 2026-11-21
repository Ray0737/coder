---
title: sys: arguments
summary: Give a script its settings from the command line, stop it with an exit code, and ask which Python is running.
---

> [!aha] So far a script asks its questions with `input()`. But real tools get their settings **when they start**: `python train.py --epochs 10`. The `sys` module is how a script reads those words, and how it tells the terminal whether it worked.

## sys.argv: the words you typed

When you run a script, everything you typed after `python` is handed to it as a list of text called `sys.argv`. The first item, `sys.argv[0]`, is always the script's own name.

```python
# greet.py
import sys

print(sys.argv)
```

```bash
python greet.py hello 3
# ['greet.py', 'hello', '3']
```

Change the command and watch the list change. A value in quotes stays together as one item:

```widget
argvviz
```

> [!warn] Every item in `sys.argv` is **text**, even `3`. The same trap as `input()`: convert with `int()` or `float()` before using it in a sum.

## Using the arguments

```python
import sys

if len(sys.argv) < 3:
    print("Usage: python repeat.py WORD COUNT")
    sys.exit(1)                      # stop here, and report a problem

word = sys.argv[1]
count = int(sys.argv[2])
print(word * count)
```

```bash
python repeat.py ha 3
# hahaha
```

Check `len(sys.argv)` **first**. Asking for `sys.argv[2]` when only one argument was given stops with `IndexError: list index out of range`. Printing a short "Usage:" message when something is missing is the polite way to fail.

> [!compare] Think of it like ordering at a counter. `input()` is the cashier asking you questions one at a time. Command-line arguments are handing over a filled-in order slip at the start, so the kitchen can begin without asking anything.

## sys.exit: stopping with a result

`sys.exit()` ends the program at once. The number you give is an **exit code**: `0` means success, anything else means something went wrong. Scripts that run other scripts, and tools like a scheduler, read this code.

```python
import sys

sys.exit(0)                    # finished fine
sys.exit(1)                    # a problem
sys.exit("Could not open the file")   # prints the message to the error stream and exits with 1
```

## Which Python am I running?

When a package "is not found" even though you installed it, you are often running a **different Python** than the one you installed into. Ask:

```python
import sys

print(sys.executable)      # the full path of the Python that is running this
print(sys.version)         # its version
print(sys.platform)        # 'win32', 'linux', 'darwin'
```

If `sys.executable` points to a virtual environment folder (`venv`), you are inside it. If not, you are using the system Python. On the Raspberry Pi this one line explains a lot of errors.

`sys.path` is the list of folders Python searches when you write `import something`. If an import fails, printing `sys.path` shows where Python looked.

## Reading and writing the screen

`print()` actually writes to `sys.stdout`, and error messages go to `sys.stderr`. You can write to them directly, which is how programs keep results and error messages apart:

```python
import sys

sys.stdout.write("normal output\n")
sys.stderr.write("something went wrong\n")
```

`sys.stdin` is where `input()` reads from. A script can read lines piped into it from another program: `for line in sys.stdin:`.

## When the arguments get complicated

For a few values, `sys.argv` is perfect. For options with names, defaults and a help message, Python has `argparse`:

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--epochs", type=int, default=5)
parser.add_argument("path")
args = parser.parse_args()
print(args.epochs, args.path)
```

It converts types, handles `--help` and prints clear errors for you. You do not need it yet, but you will see it in most AI training scripts.

## Try it

1. Write a script that prints how many arguments it received.
2. Make `add.py` that adds two numbers given on the command line: `python add.py 3 4` prints 7.
3. Make it print a "Usage" message and exit with code 1 when fewer than two numbers are given.
4. Print `sys.executable`. Is it inside a `venv` folder?
5. Why is `sys.argv[0]` not the first thing you typed after the script name?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `sys.argv` | an order slip handed over at the start | the list of words typed after `python` |
| `sys.argv[0]` | the name on the slip | the script's own name |
| `len(sys.argv)` | counting the lines on the slip | check you got enough arguments |
| `sys.exit(code)` | closing the shop with a note | stops now, 0 means success |
| `sys.executable` | the ID badge of the Python in use | which Python is running |
| `sys.path` | the places to look for tools | where `import` searches |
| `argparse` | a proper order form | named options, defaults and `--help` |
