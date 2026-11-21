---
title: Loops
summary: Repeat work with for and while, control the count with range(), and leave early with break and continue.
---

> [!aha] A computer is good at one thing humans hate: doing the same job a thousand times without getting bored. A **loop** is how you tell it "do this again".

## for: do it once for each item

A `for` loop walks through a collection one item at a time, like a teacher calling out each item on a register. The variable after `for` (here `fruit`) holds the current item.

```python
for fruit in ["apple", "banana", "cherry"]:
    print(fruit)
```

Text is a collection of letters too:

```python
for ch in "Python":
    print(ch)
```

## range(): a counted list of numbers

When you just want to repeat something a number of times, use `range()`. It makes the numbers for you. It takes up to three values: `range(start, stop, step)`. The numbers stop **before** `stop`.

```widget
rangeviz
```

| Form | Gives |
|---|---|
| `range(5)` | 0, 1, 2, 3, 4 |
| `range(1, 6)` | 1, 2, 3, 4, 5 |
| `range(0, 19, 2)` | 0, 2, 4, ... 18 |
| `range(10, 0, -3)` | 10, 7, 4, 1 |

```python
for i in range(0, 101, 3):     # every third number up to 100
    print(i)
```

When you need the position **and** the item, `enumerate` hands you both:

```python
for index, value in enumerate(["a", "b", "c"]):
    print(f"Index: {index}, Value: {value}")
```

## while: keep going until the answer is no

A `while` loop does not count. It checks a question before every round, and keeps going while the answer is `True`. It is like stirring soup until it boils: you do not know how many stirs it takes.

```python
count = 0
while count < 3:
    print(count)
    count += 1       # without this line the loop never ends
```

> [!warn] If nothing inside a `while` loop ever makes the condition false, it runs **forever**. If that happens in the terminal, press `Ctrl+C` to stop it.

`x += 1` is short for `x = x + 1`. The same trick works for `-=`, `*=`, `/=` and the others.

## break and continue

| Word | What it does | Real-life picture |
|---|---|---|
| `break` | leave the loop right now | walking out of the exam room when you are done |
| `continue` | skip the rest of this round, start the next | skipping a song and playing the next one |
| `pass` | do nothing (a placeholder) | an empty seat held for someone |

```python
for i in range(10):
    if i == 5:
        break          # stops at 5
    print(i)           # prints 0 1 2 3 4

for i in range(5):
    if i == 2:
        continue       # skips 2 only
    print(i)           # prints 0 1 3 4
```

## A loop that waits for the user

A very common pattern is "keep asking until the user types q". Write `while True`, and use `break` to leave.

```python
numbers = []
while True:
    text = input("Enter a number (q to quit): ")
    if text == "q":
        break
    numbers.append(float(text))

if numbers:
    print(f"Average: {sum(numbers) / len(numbers):.2f}")
else:
    print("No data")
```

## Counting with a dictionary

Looping over text and counting each letter is a famous exercise. It uses a dictionary, which the next chapters explain, but here is the idea:

```python
text = input("Enter something: ")
count = {}
for ch in text:
    if ch == " ":
        continue                       # ignore spaces
    count[ch] = count.get(ch, 0) + 1   # start at 0, add 1
for ch in sorted(count):
    print(ch, count[ch])
```

## A loop inside a loop: drawing shapes

A loop can contain another loop. The outer loop picks the **row**, and the inner loop fills in that row. Printing shapes in the terminal is the best way to see it.

```python
for i in range(1, 10):
    print("-" * (9 - i), end="")      # leading dashes
    for j in range(1, i + 1):
        print(j, end="")              # the numbers 1 to i
    print()                           # end the row
```

This prints a staircase. `"-" * 3` gives `---`, and `end=""` stops `print` from jumping to a new line.

```python
h = int(input("Enter the height of the triangle: "))
for i in range(1, h + 1):
    space = h - i
    if i == 1:
        print(" " * space + "*")
    elif i == h:
        print("*" * (2 * h - 1))
    else:
        print(" " * space + "*" + " " * (2 * i - 3) + "*")
```

> [!tip] To understand a nested loop, write the values by hand for the first two rows. Row 1 uses `i = 1`, row 2 uses `i = 2`, and so on. The shape comes from how the spaces and stars change with `i`.

## Handy tips

- **Loop over two lists together.** `for a, b in zip(names, prices):` walks both at the same time, stopping at the shorter one.
- **Backwards.** `for i in reversed(items):` or `range(10, 0, -1)` counts down.
- **Do not need the counter?** Name it `_`: `for _ in range(3): print("hi")` says hi three times.
- **A total without writing a loop.** `sum(range(1, 101))` adds 1 to 100.
- **Start from a clean value.** Set `total = 0` **before** the loop, not inside it, or it resets to 0 every round.
- **Off by one.** `range(5)` is 0 to 4, not 5. If you are one short or one over, check where the loop starts and stops.
- **A loop that never stops.** In a `while`, make sure something inside changes the condition. If the program hangs, press `Ctrl+C`.
- **Nested loops get slow.** A loop inside a loop of 1,000 each runs a million times. That is fine for shapes and small lists, but think twice for big data.

## Try it

1. Print the numbers 1 to 10 with a `for` loop, then again with a `while` loop.
2. Print all the even numbers from 0 to 20.
3. Ask for numbers until the user types `q`, then print the largest and the smallest.
4. Print a triangle of `*` that is 5 rows tall, growing one star per row.
5. What is the difference between `break` and `continue`? Write one example of each.

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `for x in items` | calling the register | one round per item |
| `range(a, b, c)` | a counter | the numbers from a up to (not including) b |
| `while condition` | stirring until it boils | repeats while true |
| `break` | leaving the room | exits the loop |
| `continue` | skipping a song | jumps to the next round |
| nested loop | rows and columns | the outer picks the row, the inner fills it |
