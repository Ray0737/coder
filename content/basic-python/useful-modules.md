---
title: Useful modules
summary: Borrow ready-made tools: math, random, time, datetime, statistics and json, and how to import them.
---

> [!aha] Nobody writes everything from scratch. Python ships with a huge toolbox called the **standard library**, split into drawers called **modules**. You open a drawer with `import`, and the tools inside are yours.

## Three ways to import

You can open the whole drawer, take just one or two tools, or open it under a shorter name.

```python
import math                    # open the whole drawer: math.sqrt(16)
from math import pi, sqrt      # take just two tools: sqrt(16)
import random as rnd           # open it under a shorter name: rnd.randint(1, 10)
```

## Which style, when

The three styles differ in what you write afterwards, so pick the one that keeps your code clear.

| Style | You then write | Use when |
|---|---|---|
| `import math` | `math.sqrt(16)` | you want it clear where a tool comes from |
| `from math import sqrt` | `sqrt(16)` | you use one or two tools a lot |
| `import random as rnd` | `rnd.randint(1, 6)` | the name is long |

> [!warn] Do not name your own file after a module. A file called `random.py` or `math.py` next to your script will be imported **instead of** the real one, and you will get strange errors like `AttributeError: module 'random' has no attribute 'randint'`.

## Your own file is a module

Your own `.py` file is a module too. If you have `my_module.py` with a function `say_hello`, another file in the same folder can write `import my_module` and call `my_module.say_hello()`.

## math: numbers

The `math` module has the maths helpers that the plain operators do not cover. Each line calls one function: `pi` is a constant, `sqrt` is a square root, `ceil` always rounds up, `floor` always rounds down, and `hypot(3, 4)` is the length of the long side of a right triangle with sides 3 and 4.

```python
import math

print(math.pi)            # 3.141592653589793
print(math.sqrt(49))      # 7.0
print(math.ceil(2.1))     # 3, always rounds up
print(math.floor(2.9))    # 2, always rounds down
print(math.hypot(3, 4))   # 5.0, the long side of a right triangle
```

## Built-in helpers

Python also has built-in helpers that need no import: `abs(-5)` is 5, `round(3.14159, 2)` is 3.14, `max`, `min`, `sum` and `pow(2, 3)`.

```python
print(abs(-5), round(3.14159, 2), pow(2, 3))     # 5 3.14 8
print(max(4, 9, 1), min(4, 9, 1), sum([4, 9, 1]))   # 9 1 14
```

> [!tip] `round()` rounds halves to the **nearest even number**: `round(2.5)` is 2 and `round(3.5)` is 4. If you need school-style rounding, add 0.5 and use `math.floor`, for example `math.floor(2.5 + 0.5)` gives 3.

## random: chance

The `random` module gives dice rolls, shuffles and random picks. `randint(1, 6)` is a dice roll, `random()` is a decimal from 0 up to 1, `uniform` gives a decimal in a range, and `choice` picks one item from a list. `shuffle` reorders the list itself, while `sample` picks several different items and leaves the list alone.

```python
import random

print(random.randint(1, 6))               # 1 to 6, both ends included (a dice)
print(random.random())                    # 0.0 up to, not including, 1.0
print(random.uniform(1.5, 2.5))           # a random decimal in a range
print(random.choice(["rock", "paper", "scissors"]))

cards = ["A", "K", "Q", "J"]
random.shuffle(cards)                     # shuffles the list itself
print(cards)
print(random.sample(cards, 2))            # 2 different items, list untouched
```

## The random calls

Here is what each call gives back, with the one detail that trips people up.

| Call | Gives | Note |
|---|---|---|
| `randint(a, b)` | a whole number from a to b | **b is included** |
| `randrange(a, b)` | a whole number from a up to b | like `range`, b is **not** included |
| `choice(items)` | one item | the list must not be empty |
| `shuffle(items)` | nothing, it reorders the list | changes the list itself |
| `sample(items, k)` | k different items | never repeats an item |

## Fixing the randomness

Random numbers are not truly random. They come from a formula, and `random.seed(42)` fixes the start, so the same "random" numbers come out every run. That is useful when you need to test or share a result.

```python
random.seed(42)
print(random.randint(1, 6), random.randint(1, 6))   # the same two numbers every run
```

## time: waiting and measuring

`time.time()` is the number of seconds since 1 January 1970. It is a plain number, good for measuring how long something took, and `perf_counter()` is the more precise stopwatch. The first part prints, pauses 2 seconds with `sleep`, then prints again. The second part notes the clock before and after adding up a million numbers, and the difference is how long it took.

```python
import time
print("Wait for it...")
time.sleep(2)                    # pause 2 seconds
print("Done")

start = time.perf_counter()
total = sum(range(1_000_000))
print(f"Took {time.perf_counter() - start:.4f} seconds")
```

> [!warn] Do not use `time.sleep()` inside a Tkinter window. It freezes the whole window. Use `root.after(milliseconds, function)` instead, as in the Tkinter GUI chapter.

## datetime: dates and clocks

`strftime` turns a date **into** text, and `strptime` reads text **into** a date. The letters after `%` choose the pieces. In the code, `now()` is the current date and time, `date.today()` is just the date, subtracting two dates gives a time difference whose `.days` is the days between them, and adding a `timedelta` moves a date forward.

```python
from datetime import datetime, date, timedelta

now = datetime.now()
print(now)                                   # 2026-11-21 14:03:09.123456
print(now.strftime("%Y-%m-%d %H:%M:%S"))     # 2026-11-21 14:03:09
print(date.today())                          # 2026-11-21

due = datetime.strptime("2026-12-31", "%Y-%m-%d")   # text to a date
print((due - now).days)                      # days between two dates
print(now + timedelta(days=7))               # one week from now
```

## Try your own pattern

Type your own pattern and watch the date turn into text.

```widget
timefmt
```

## The format codes

These are the letters you can use after `%`.

| Code | Gives |
|---|---|
| `%Y` / `%y` | year, 2026 / 26 |
| `%m` / `%d` | month / day, always two digits |
| `%B` / `%b` | month name, November / Nov |
| `%A` / `%a` | weekday, Saturday / Sat |
| `%H` / `%I %p` | hour on a 24-hour clock / 12-hour clock with AM or PM |
| `%M` / `%S` | minutes / seconds |

## statistics: quick summaries

The `statistics` module gives the usual summary numbers of a list in one call. `mean` is the average, `median` is the middle value when sorted, and `mode` is the most common value, so for these scores the answers are 78, 85 and 85.

```python
import statistics

scores = [70, 85, 90, 85, 60]
print(statistics.mean(scores))      # 78
print(statistics.median(scores))    # 85, the middle value
print(statistics.mode(scores))      # 85, the most common
```

## json: save data to a file

Variables disappear when the program ends. To keep data, write it to a file. **JSON** is a text format that looks like Python dictionaries and lists, so it is the easiest way to save them. In the code, `json.dump` writes the dictionary into `data.json` (`indent=4` makes it readable), and `json.load` reads it back into a dictionary, so `loaded["tasks"][0]` is the first task.

```python
import json

data = {"tasks": ["read chapter 4", "python quiz"], "done": 1}

with open("data.json", "w") as f:       # "w" writes, and replaces the old file
    json.dump(data, f, indent=4)

with open("data.json", "r") as f:       # "r" reads
    loaded = json.load(f)
print(loaded["tasks"][0])               # read chapter 4
```

## Check the file exists

`with open(...)` closes the file for you, even if an error happens, and `"a"` **appends** to the end instead of replacing. If the file might not exist yet, check first. `os.path.exists` returns True if the file is there, so the `if` only reads it when it is safe.

```python
import os

if os.path.exists("data.json"):
    ...                                  # safe to read
```

> [!compare] Think of it like a toolbox shelf in a workshop. Each module is a labelled drawer: `math` for measuring, `random` for dice, `time` for the clock, `json` for the filing cabinet. You do not build the tools, you just open the right drawer.

## Not sure what a module can do?

Ask Python itself. The official list lives at `docs.python.org/3/library`, and for tools that are **not** built in, such as NumPy and Pandas, you install them first with `pip install numpy` and then import them the same way.

```python
import math
print(dir(math))            # every name inside the module
help(math.sqrt)             # what one tool does
```

## Try it

1. Make a program that rolls two dice with `randint` and prints the total.
2. Pick a random item from a list of five snacks with `random.choice`.
3. Print today's date as `21/11/26` with `strftime`.
4. Ask for a year, month and day and print how many days away that date is.
5. Save a dictionary of three items to a JSON file, then load it back and print one value.

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `import x` / `from x import y` | opening a drawer / taking one tool | brings in a module |
| `math` | a ruler and calculator | pi, square roots, ceil and floor |
| `random` | dice and a shuffled deck | random numbers and choices |
| `time.sleep` / `perf_counter` | a pause button and a stopwatch | waits, or measures how long something took |
| `datetime` + `strftime` | a calendar | dates, and dates turned into text |
| `statistics` | a quick summary sheet | mean, median, mode |
| `json` + `with open` | a filing cabinet | saves data and reads it back |
