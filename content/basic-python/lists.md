---
title: Lists
summary: Keep many values in one variable, pick them by position, and add, remove or sort them.
---

> [!aha] A variable holds one value. A **list** holds as many as you like, in order. Think of a row of school lockers: each locker has a number, and the number is how you find what is inside.

## Making a list

A list is a row of lockers. Square brackets mark the row, and commas separate the lockers. A list can hold any mix of things, and the same value can appear twice.

```python
playlist = ["Blue", "Sunrise", "Tokyo", "Echo"]
mixed = [0, 1, 2, "a", "b", "c"]
empty = []
```

## Index: the locker number

Each item has a position called an **index**. It starts at **0**, not 1, so the first locker is number 0. Negative numbers count from the end: `-1` is the last item.

```python
print(playlist[0])     # Blue, the first song
print(playlist[3])     # Echo
print(playlist[-1])    # Echo, the last song
```

Asking for a position that does not exist, such as `playlist[10]`, stops the program with `IndexError: list index out of range`.

You can swap what is inside a locker by assigning to its index, and `len()` tells you how many lockers there are:

```python
playlist[1] = "Moonlight"       # Sunrise is replaced
print(playlist)                 # ['Blue', 'Moonlight', 'Tokyo', 'Echo']
print(len(playlist))            # 4
```

## Changing a list

Press the buttons and watch the row change. The number above each item is its index, and the number below is its negative index.

```widget
listops
```

| Method | What it does |
|---|---|
| `append(x)` | add `x` to the end |
| `insert(i, x)` | put `x` at position `i`, and push the rest along |
| `pop()` | remove the last item and give it back |
| `pop(0)` | remove the item at position 0 and give it back |
| `remove(x)` | remove the first item equal to `x` |
| `sort()` | put the items in order, changing the list itself |
| `reverse()` | flip the order, changing the list itself |

> [!compare] Think of it like a music playlist. `append` adds a song to the end, `pop(0)` plays and removes the first song, `insert(1, x)` slots a song in as the second track, and `sort()` puts the songs in A to Z order.

## Slicing: a piece of the row

A **slice** copies a section of a list. `[start:stop]` takes from `start` up to, but **not including**, `stop`.

```python
nums = [10, 20, 30, 40, 50]
print(nums[1:3])     # [20, 30]
print(nums[:2])      # [10, 20]  from the start
print(nums[2:])      # [30, 40, 50]  to the end
```

## Building a list from input

Start with an empty list and `append` each answer. This is the pattern behind most programs that collect data.

```python
cart = ["rice", "eggs"]
cart.append(input("Add an item: "))
cart.append(input("Add another item: "))
print(cart)
```

> [!tip] `sort()` changes the list and gives back nothing. If you write `x = playlist.sort()`, then `x` is `None`. To keep the original and get a sorted copy, use `sorted(playlist)`.

A list is only one of the ways Python holds data. Tuples, dictionaries, sets, text and `range` are the others, and the **Tuples and dicts** chapter compares them all.

## Handy tips

- **Totals at a glance.** `sum(nums)`, `min(nums)` and `max(nums)` work on a list of numbers with no loop.
- **Is it in there?** `"Echo" in playlist` gives `True` or `False`. Use `playlist.index("Echo")` to find where it is, but it crashes if the item is missing, so check with `in` first.
- **Sort without changing the original.** `sorted(nums)` gives a new sorted list, and `sorted(nums, reverse=True)` goes from big to small.
- **Add many at once.** `a.extend([4, 5])` adds each item. `a.append([4, 5])` would add the whole list as one item.
- **A list name is a label, not a copy.** `b = a` makes two names for the **same** list, so changing one changes the other. Make a real copy with `b = a.copy()` or `b = a[:]`.
- **A one-line list builder.** `[x * 2 for x in nums]` doubles every number, and `[x for x in nums if x > 10]` keeps only the big ones. This is called a list comprehension.
- **Do not change a list while looping over it.** Removing items mid-loop skips some of them. Loop over a copy, or build a new list instead.

## Try it

1. Make a list of five favourite songs. Print the first, the last and the third.
2. Change the second song to something else, then print the whole list.
3. Ask for three words with `input()`, put them in a list and print it.
4. Sort `[0, 4, 2, 3, 1]` and print it. Then print the middle item.
5. What does `[10, 20, 30, 40, 50][1:3]` give, and why not 40?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `[a, b, c]` | a row of lockers | keeps many values in order |
| `my_list[0]` | opening locker 0 | the first item (counting starts at 0) |
| `my_list[-1]` | the last locker | the last item |
| `append` / `insert` | joining the queue | adds an item |
| `pop` / `remove` | being served | takes an item out |
| `sort()` / `reverse()` | tidying the row | reorders the list itself |
| `my_list[1:3]` | a section of the row | a copy of part of the list |
