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

> [!more] TLDR: for
> `for item in collection:` runs the indented lines once per item, with the item in the variable.

## for over text

Text is a collection of letters too, so a `for` loop can walk through a word one letter at a time.

```python
for ch in "Python":
    print(ch)
```

> [!more] TLDR: for over text
> A string is a collection of letters, so `for ch in word:` visits one letter at a time.

## range(): a counted list of numbers

When you just want to repeat something a number of times, use `range()`. It makes the numbers for you. It takes up to three values: `range(start, stop, step)`. The numbers stop **before** `stop`.

```widget
rangeviz
```

> [!more] TLDR: range()
> `range(start, stop, step)` makes numbers up to, but not including, stop.

## The forms of range

Leave out `start` and it begins at 0, leave out `step` and it counts by 1, and a negative step counts down.

| Form | Gives |
|---|---|
| `range(5)` | 0, 1, 2, 3, 4 |
| `range(1, 6)` | 1, 2, 3, 4, 5 |
| `range(0, 19, 2)` | 0, 2, 4, ... 18 |
| `range(10, 0, -3)` | 10, 7, 4, 1 |

> [!more] TLDR: the forms of range
> `range(5)` is 0 to 4, `range(2, 5)` is 2 to 4 and `range(10, 0, -2)` counts down.

## range in a loop

Put a `range` after `in` and the loop runs once for each number it makes, here every third number up to 100.

```python
for i in range(0, 101, 3):     # every third number up to 100
    print(i)
```

> [!more] TLDR: range in a loop
> `for i in range(n):` repeats n times, and `i` holds the current number.

## enumerate: position and item

When you need the position **and** the item, `enumerate` hands you both.

```python
for index, value in enumerate(["a", "b", "c"]):
    print(f"Index: {index}, Value: {value}")
```

> [!more] TLDR: enumerate
> `for i, item in enumerate(list):` gives the position and the item together.

## while: keep going until the answer is no

A `while` loop does not count. It checks a question before every round, and keeps going while the answer is `True`. It is like stirring soup until it boils: you do not know how many stirs it takes. In the code, `x += 1` is short for `x = x + 1`, and the same trick works for `-=`, `*=`, `/=` and the others.

```python
count = 0
while count < 3:
    print(count)
    count += 1       # without this line the loop never ends
```

> [!warn] If nothing inside a `while` loop ever makes the condition false, it runs **forever**. If that happens in the terminal, press `Ctrl+C` to stop it.

> [!more] TLDR: while
> `while condition:` checks the condition before every round, and runs the block only while it is true. You use it when you do not know how many rounds you need. Something inside the loop must eventually make the condition false, such as `x += 1`, or the loop never ends. If that happens by accident, press Ctrl+C to stop the program.

## break and continue

Three small words steer a loop from the inside: `break` leaves it, `continue` skips to the next round, and `pass` does nothing.

| Word | What it does | Real-life picture |
|---|---|---|
| `break` | leave the loop right now | walking out of the exam room when you are done |
| `continue` | skip the rest of this round, start the next | skipping a song and playing the next one |
| `pass` | do nothing (a placeholder) | an empty seat held for someone |

> [!more] TLDR: break, continue, pass
> `break` leaves the loop completely and carries on after it. `continue` skips the rest of this round and jumps to the next one. `pass` does nothing and is only a placeholder where Python needs some line. In nested loops, `break` and `continue` only affect the loop they are written in.

## break and continue in code

The first loop stops completely at 5, and the second only skips the single round where `i` is 2. In the first loop `i` counts 0, 1, 2, 3, 4 and then `break` ends the loop the moment `i` reaches 5, so 5 is never printed. In the second loop `continue` skips only the round where `i` is 2, so it prints 0 1 3 4.

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

> [!more] TLDR: break and continue in code
> `break` at 5 stops the loop, while `continue` at 2 only skips that round.

## A loop that waits for the user

A very common pattern is "keep asking until the user types q". Write `while True`, and use `break` to leave. Each round asks for text. If it is `q` the loop stops, and otherwise `float(text)` turns it into a number and `append` stores it. After the loop, `if numbers:` checks the list is not empty before averaging, so typing `q` straight away does not divide by zero.

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

> [!more] TLDR: wait for the user
> `while True:` with a `break` on a stop word keeps asking until the user is done.

## A menu inside a menu: a cafe program

Each menu is its own `while True` loop. The outer loop is the main menu and the inner loop is the order menu. `break` leaves only the loop it is written in, so after paying, the inner `break` returns to the main menu and the outer `break` ends the program.

```python
price = {"1": 50, "2": 65, "3": 45}              # menu number (as text): price in THB
names = {"1": "Tea", "2": "Cocoa", "3": "Coffee"}
qty = {"1": 0, "2": 0, "3": 0}                   # cups ordered of each
members = []

def payment(username):
    total = 0
    for k in qty:
        total += price[k] * qty[k]
        print(f"{names[k]}: {qty[k]} cups = {price[k] * qty[k]} THB")
    discount = total * 0.10 if username in members else 0     # members get 10% off
    print(f"Total: {total} THB | Discount: {discount} THB | Pay: {total - discount} THB")

while True:                                      # main menu: repeats until Exit
    print("1. Register member  2. Order and pay  3. Exit")
    action = input("Choose an action: ")
    if action == "1":
        members.append(input("Member name: "))
    elif action == "2":
        username = input("Name: ")
        print("1: Tea 50 | 2: Cocoa 65 | 3: Coffee 45 | 0: Pay")
        while True:                              # order menu: repeats until 0
            menu = input("Choose a menu: ")      # kept as text, so letters cannot crash it
            if menu == "0":
                payment(username)
                for k in qty:
                    qty[k] = 0                   # the next customer starts fresh
                break                            # leaves the order menu only
            elif menu in price:
                qty[menu] += 1
            else:
                print("Please choose 0 to 3 only")
    elif action == "3":
        break                                    # leaves the main menu: the program ends
    else:
        print("Please choose 1, 2 or 3")
```

> [!compare] Think of it like a lift in a building. The main menu is the ground floor lobby and the order menu is a floor you ride up to. Paying takes you back down to the lobby, and only walking out of the front door (Exit) leaves the building.

> [!more] TLDR: menu inside a menu
> Each menu is its own `while True` loop, and the inner loop sits inside one choice of the outer one. `break` leaves only the loop it is written in, so the inner `break` goes back to the main menu and the outer `break` ends the program. Keeping the menu choice as text means a wrong key just prints a warning and the loop runs again.

## Counting with a dictionary

Looping over text and counting each letter is a famous exercise. It uses a dictionary, which the next chapters explain, but here is the idea: `count` starts empty. For each letter that is not a space, `count.get(ch, 0)` returns how many times the letter was seen so far (0 if it is new), and the code stores that plus 1. The last loop goes through the letters in alphabetical order and prints each with its total.

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

> [!more] TLDR: counting with a dict
> `count[ch] = count.get(ch, 0) + 1` counts anything, because `get` gives 0 for a new key.

## A loop inside a loop: drawing shapes

A loop can contain another loop. The outer loop picks the **row**, and the inner loop fills in that row. Printing shapes in the terminal is the best way to see it. This one prints a staircase, where `"-" * 3` gives `---` and `end=""` stops `print` from jumping to a new line. In the code, each row first prints `9 - i` dashes, then the inner loop prints the numbers 1 to `i` on the same line, and the bare `print()` ends the row.

```python
for i in range(1, 10):
    print("-" * (9 - i), end="")      # leading dashes
    for j in range(1, i + 1):
        print(j, end="")              # the numbers 1 to i
    print()                           # end the row
```

> [!more] TLDR: loop in a loop
> The outer loop picks the row and the inner loop fills that row. For every one round of the outer loop, the inner loop runs all of its rounds, so 3 rows of 4 stars take 12 steps. `print("*", end="")` keeps the stars on the same line, and a plain `print()` after the inner loop ends the row.

## A hollow triangle

The same idea with spaces and stars draws a triangle of the height you type. `h` is the height. For each row `i`, `space = h - i` spaces push the stars to the right place. The first row is a single star, the last row is a full line of `2h - 1` stars, and every row in between is a star, some spaces and a second star, which makes the hollow middle.

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

> [!more] TLDR: hollow triangle
> Spaces push the stars into place, and only the first and last star of a row are printed.

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
6. In the cafe program, which `break` ends the whole program, and which one only returns to the main menu? What would happen if the pay branch had no `break`?
7. Add a fourth drink to the order menu, then a menu option that shows the total so far without paying.
8. Make the discount depend on the total, for example 10% only when the bill is over 100 THB.

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `for x in items` | calling the register | one round per item |
| `range(a, b, c)` | a counter | the numbers from a up to (not including) b |
| `while condition` | stirring until it boils | repeats while true |
| `break` | leaving the room | exits the loop |
| `continue` | skipping a song | jumps to the next round |
| nested loop | rows and columns | the outer picks the row, the inner fills it |
| menu inside a menu | a lift with floors | an outer `while True` for the main menu, an inner one for the order menu, and `break` leaves only the loop it is in |
