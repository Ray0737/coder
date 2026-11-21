---
title: Useful modules
summary: Borrow ready-made tools: math, random, time, datetime, statistics and json, and how to import them.
---

> [!aha] Nobody writes everything from scratch. Python ships with a huge toolbox called the **standard library**, split into drawers called **modules**. You open a drawer with `import`, and the tools inside are yours.

## Three ways to import

```python
import math                    # open the whole drawer: math.sqrt(16)
from math import pi, sqrt      # take just two tools: sqrt(16)
import random as rnd           # open it under a shorter name: rnd.randint(1, 10)
```

| Style | You then write | Use when |
|---|---|---|
| `import math` | `math.sqrt(16)` | you want it clear where a tool comes from |
| `from math import sqrt` | `sqrt(16)` | you use one or two tools a lot |
| `import random as rnd` | `rnd.randint(1, 6)` | the name is long |

> [!warn] Do not name your own file after a module. A file called `random.py` or `math.py` next to your script will be imported **instead of** the real one, and you will get strange errors like `AttributeError: module 'random' has no attribute 'randint'`.

Your own `.py` file is a module too. If you have `my_module.py` with a function `say_hello`, another file in the same folder can write `import my_module` and call `my_module.say_hello()`.

## math: numbers

```python
import math

print(math.pi)            # 3.141592653589793
print(math.sqrt(49))      # 7.0
print(math.ceil(2.1))     # 3, always rounds up
print(math.floor(2.9))    # 2, always rounds down
print(math.hypot(3, 4))   # 5.0, the long side of a right triangle
```

Python also has built-in helpers that need no import: `abs(-5)` is 5, `round(3.14159, 2)` is 3.14, `max`, `min`, `sum` and `pow(2, 3)`.

> [!tip] `round()` rounds halves to the **nearest even number**: `round(2.5)` is 2 and `round(3.5)` is 4. If you need school-style rounding, add 0.5 and use `math.floor`, for example `math.floor(2.5 + 0.5)` gives 3.

## random: chance

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

| Call | Gives | Note |
|---|---|---|
| `randint(a, b)` | a whole number from a to b | **b is included** |
| `randrange(a, b)` | a whole number from a up to b | like `range`, b is **not** included |
| `choice(items)` | one item | the list must not be empty |
| `shuffle(items)` | nothing, it reorders the list | changes the list itself |
| `sample(items, k)` | k different items | never repeats an item |

Random numbers are not truly random. They come from a formula, and `random.seed(42)` fixes the start, so the same "random" numbers come out every run. That is useful when you need to test or share a result.

## time: waiting and measuring

```python
import time

print("Wait for it...")
time.sleep(2)                    # pause 2 seconds
print("Done")

start = time.perf_counter()
total = sum(range(1_000_000))
print(f"Took {time.perf_counter() - start:.4f} seconds")
```

`time.time()` is the number of seconds since 1 January 1970. It is a plain number, good for measuring how long something took. `perf_counter()` is the more precise stopwatch.

> [!warn] Do not use `time.sleep()` inside a Tkinter window. It freezes the whole window. Use `root.after(milliseconds, function)` instead, as in the Tkinter GUI chapter.

## datetime: dates and clocks

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

`strftime` turns a date **into** text, and `strptime` reads text **into** a date. The letters after `%` choose the pieces. Type your own pattern below:

```widget
timefmt
```

| Code | Gives |
|---|---|
| `%Y` / `%y` | year, 2026 / 26 |
| `%m` / `%d` | month / day, always two digits |
| `%B` / `%b` | month name, November / Nov |
| `%A` / `%a` | weekday, Saturday / Sat |
| `%H` / `%I %p` | hour on a 24-hour clock / 12-hour clock with AM or PM |
| `%M` / `%S` | minutes / seconds |

## statistics: quick summaries

```python
import statistics

scores = [70, 85, 90, 85, 60]
print(statistics.mean(scores))      # 78
print(statistics.median(scores))    # 85, the middle value
print(statistics.mode(scores))      # 85, the most common
```

## json: save data to a file

Variables disappear when the program ends. To keep data, write it to a file. **JSON** is a text format that looks like Python dictionaries and lists, so it is the easiest way to save them.

```python
import json

data = {"tasks": ["read chapter 4", "python quiz"], "done": 1}

with open("data.json", "w") as f:       # "w" writes, and replaces the old file
    json.dump(data, f, indent=4)

with open("data.json", "r") as f:       # "r" reads
    loaded = json.load(f)
print(loaded["tasks"][0])               # read chapter 4
```

`with open(...)` closes the file for you, even if an error happens. Use `"a"` to **append** to the end instead of replacing. If the file might not exist yet, check first:

```python
import os

if os.path.exists("data.json"):
    ...                                  # safe to read
```

> [!compare] Think of it like a toolbox shelf in a workshop. Each module is a labelled drawer: `math` for measuring, `random` for dice, `time` for the clock, `json` for the filing cabinet. You do not build the tools, you just open the right drawer.

## Not sure what a module can do?

Ask Python itself:

```python
import math
print(dir(math))            # every name inside the module
help(math.sqrt)             # what one tool does
```

The official list lives at `docs.python.org/3/library`. For tools that are **not** built in, such as NumPy and Pandas, you install them first with `pip install numpy` and then import them the same way.

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
