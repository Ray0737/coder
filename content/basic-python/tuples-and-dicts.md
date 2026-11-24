---
title: Tuples and dicts
summary: A tuple is a list you cannot change. A dictionary stores values under names, so you look them up by key.
---

> [!aha] A list is found by **position** (locker 0, locker 1). A dictionary is found by **name**, like a real dictionary where you look up a word to get its meaning. That one idea changes how you store data.

## Tuples: a sealed list

A **tuple** looks like a list, but with round brackets, and once made it cannot be changed. Use it for things that should stay fixed, such as the twelve zodiac animals or the days of the week. In the code, `constellations` is a tuple of the twelve animals, `constellations[0]` is "Rat", `len` gives 12, and the commented line would fail with a `TypeError` because tuples cannot be changed.

```python
constellations = ("Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
                  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig")
print(constellations[0])        # Rat
print(len(constellations))      # 12
# constellations[0] = "Cat"     # TypeError: tuples are immutable
```

> [!more] TLDR: tuples
> A tuple uses round brackets, such as `(1, 2, 3)`, and cannot be changed after it is made, so `t[0] = 5` is an error. That is the point: it guarantees the values stay fixed, like the twelve zodiac animals or the days of the week. A tuple with one item needs a comma, as in `(5,)`, because `(5)` is just the number 5 in brackets.

## Reading a tuple

You read a tuple by index and slice it just like a list. You can also ask `count` and `index`.

```python
t = (1, "hello", 3.14, "hello")
print(t.count("hello"))     # 2
print(t.index(3.14))        # 2
```

> [!compare] Think of it like a printed menu card and a whiteboard menu. The whiteboard (a list) can be rubbed out and rewritten. The printed card (a tuple) is fixed, so nobody can change a price by accident.

> [!more] TLDR: reading a tuple
> Index and slice it like a list, and use `count` and `index`. Nothing in it can be changed.

## Unpacking

You can pull a tuple apart into separate variables in one line. This is how a function returns two values.

```python
point = (3, 7)
x, y = point
print(x, y)         # 3 7
```

> [!more] TLDR: unpacking
> `a, b = pair` pulls a tuple into separate variables in one line. It is how a function returns two values.

## Matching two tuples with an index

Two tuples of the same length can be used as a pair of matching columns. The zodiac exercise finds the animal for a year with a remainder. The year is shifted by 5 and divided by 12, and the remainder is the position in the cycle, so `(year + 5) % 12` picks the right animal from `names` for each year from 2565 to 2570.

```python
names = ("Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
         "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig")
for year in range(2565, 2571):
    i = (year + 5) % 12          # the position in the cycle of 12
    print(f"Year {year}: {names[i]}")
```

> [!more] TLDR: matching with an index
> Two tuples of the same length work as two matching columns. A remainder from `%` picks the position.

## Dictionaries: look it up by name

A **dictionary** stores **key: value** pairs inside curly brackets. You give it a key, and it gives you the value.

```python
menu = {"Burger": 250, "Pizza": 199, "Frenchfries": 299}
print(menu["Pizza"])        # 199
```

> [!more] TLDR: dictionaries
> A dictionary stores `key: value` pairs in curly brackets. Give a key and you get its value.

## Look a key up

Look up a key below and notice what happens with a key that is not in the menu. Use `[]` when the key must exist, and `.get()` when it might not, because `.get()` gives `None` instead of crashing. You can also give `.get()` a fallback: `menu.get("Salad", 0)`.

```widget
dictlookup
```

> [!more] TLDR: looking up a key
> `d[key]` stops the program with a `KeyError` if the key is not in the dictionary. `d.get(key)` gives `None` instead, and `d.get(key, 0)` gives a fallback you choose. Use `[]` when the key must exist, so a mistake is loud, and `.get()` when it might not. `key in d` is the yes-or-no version.

## Changing a dictionary

These are the everyday jobs on a dictionary, one line each.

| Task | Code |
|---|---|
| change a value | `menu["Pizza"] = 210` |
| add a new pair | `menu["Salad"] = 120` |
| delete a pair | `del menu["Burger"]` |
| check a key exists | `"Pizza" in menu` |
| all the keys | `menu.keys()` |
| all the values | `menu.values()` |
| all the pairs | `menu.items()` |

> [!more] TLDR: changing a dictionary
> `d[key] = value` adds or replaces, and `pop` and `del` remove.

## Looping over a dictionary

`keys()`, `values()` and `items()` give you the parts to loop over, and `items()` hands back each key and value together. In the code, `keys()` and `values()` give the parts and `items()` gives each pair together, so the `for` loop can unpack each pair into `short` and `full`.

```python
weekday = {"Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday"}
print(weekday.keys())       # dict_keys(['Mon', 'Tue', 'Wed'])
print(weekday.values())

for short, full in weekday.items():
    print(short, "=", full)
```

> [!more] TLDR: looping
> `keys()`, `values()` and `items()` give the parts to loop over, and `items()` gives each key and value together.

## Keys and values

Keys must be unique and cannot be changed (strings, numbers and tuples work, lists do not). Values can be anything, even a list.

```python
account = {"admin": ["test1", 0]}    # key: username, value: [password, balance]
account["admin"][1] += 100           # add 100 to the balance
```

> [!more] TLDR: keys and values
> Keys must be unique and unchangeable: strings, numbers and tuples work, lists do not. Values can be anything.

## Sets: no duplicates

A **set** keeps each value only once and has no order. It is good for removing duplicates and for asking what two groups share. To remove duplicates from a list, pass it through a set: `list(set([1, 2, 2, 3]))`.

```python
print({1, 2, 3, 2, 1})                  # {1, 2, 3}
print({1, 2}.union({3, 4}))             # {1, 2, 3, 4}
print({1, 2}.intersection({2, 3}))      # {2}
```

> [!more] TLDR: sets
> A set keeps each value once and has no order. `list(set(items))` removes duplicates.

## Where Python keeps data

Lists, tuples and dictionaries are not the only places. Everything that holds **more than one thing** is a **container**, and Python has these:

| Container | Brackets | Ordered? | Can change? | Duplicates? | Found by | Example |
|---|---|---|---|---|---|---|
| list | `[ ]` | yes | yes | yes | position | `[1, 2, 3]` |
| tuple | `( )` | yes | no | yes | position | `(1, 2, 3)` |
| dictionary | `{ k: v }` | yes (by insertion) | yes | keys no | key | `{"a": 1}` |
| set | `{ }` | no | yes | no | (membership only) | `{1, 2, 3}` |
| string | `" "` | yes | no | yes | position | `"hello"` |
| range | `range()` | yes | no | no | position | `range(5)` |

> [!more] TLDR: strings, ranges and data outside the program
> A string is a tuple-like row of letters, so `"hello"[1]` gives `"e"` and you can loop over it. A `range` is a row of numbers made on demand. Tuples, strings and ranges are **sealed**, while lists, dictionaries and sets can change.
>
> Data also lives outside the program. A **variable** holds one value in memory and disappears when the program ends. To keep data after that, you save it to a **file** (for example JSON, as in the capstone), which comes back next time you run the program.

## Enum: a fixed set of named choices

An **Enum** is not a container for data, it is a way to give names to a small fixed set of choices, such as priorities or directions. Instead of typing the text `"Red: Critical"` and risking a typo, you use a name Python can check. It is not part of the class exercises, but you will meet it in real code. Writing `Priority.CRTICAL` with a typo stops at once with an `AttributeError`, while a mistyped string like `"Rde"` would quietly be a wrong value.

```python
from enum import Enum

class Priority(Enum):
    CRITICAL = "Red"
    CAUTION = "Yellow"
    REGULAR = "White"

p = Priority.CAUTION
print(p.name)        # CAUTION
print(p.value)       # Yellow
print(Priority("Red"))     # Priority.CRITICAL

for item in Priority:      # loop over every choice
    print(item.name)
```

> [!more] TLDR: enum
> An `Enum` gives names to a small fixed set of choices, so a typo becomes an error.

## Which one should I use?

Pick the container from what you need to do with the data.

| I need to... | Use |
|---|---|
| keep a group that changes, in order | list |
| keep a group that must not change | tuple |
| look things up by a name | dictionary |
| remove duplicates, or test "is it in the group?" fast | set |
| keep it after the program closes | a file (text or JSON) |

> [!compare] Think of it like kitchen storage. A **list** is a shelf where you can reorder things, a **tuple** is a sealed box, a **dictionary** is a spice rack with labels, a **set** is a jar of marbles where duplicates fall out, and a **file** is the fridge that keeps food after you leave the kitchen.

> [!more] TLDR: which one to use
> Ask what you do with the data. If it keeps an order and changes, use a list. If it must stay fixed, use a tuple. If you look things up by a name, use a dictionary. If you only care about which values exist and want no duplicates, use a set. Choosing the right container makes the code shorter and the mistakes fewer.

## Handy tips

- **Count with a dictionary.** `count[x] = count.get(x, 0) + 1` adds one to a counter, starting from 0 if the key is new.
- **Sort a dictionary.** `sorted(menu.items())` sorts by key, and `sorted(menu.items(), key=lambda p: p[1])` sorts by value.
- **Build one in a line.** `{n: n * n for n in range(5)}` gives `{0: 0, 1: 1, 2: 4, 3: 9, 4: 16}`, and `dict(zip(names, prices))` pairs two lists up.
- **Merge two.** `a.update(b)` copies every pair of `b` into `a`, replacing matching keys.
- **Nest them.** A value can itself be a dictionary: `shop = {"apple": {"price": 12, "stock": 40}}`, then `shop["apple"]["price"]`.
- **Loop in pairs.** `for key, value in d.items():` gives both at once. A plain `for key in d:` gives only the keys.
- **A one-item tuple needs a comma.** `(5,)` is a tuple, while `(5)` is just the number 5.
- **Swap two variables in one line.** `a, b = b, a`, which works because the right side is a tuple.

## Try it

1. Make a tuple of the seven days. Print the third day, then try to change it and read the error.
2. Make a dictionary of three fruits and their prices. Print one price, then add a fourth fruit.
3. Ask which food the user wants from a menu dictionary and print its price. Use `.get()` so a wrong name does not crash.
4. Loop through the menu and print every food with its price.
5. Which container would you use for a student record with name, age and grade? Why?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| tuple `( )` | a printed menu card | an ordered group that cannot change |
| dict `{k: v}` | a real dictionary | finds a value by its key |
| `d[key]` | looking up a word | the value, or `KeyError` if missing |
| `d.get(key)` | asking politely | the value, or `None` if missing |
| `.items()` | reading every entry | each key and value together |
| set | a stamp collection | only one of each, no order |
| `Enum` | a traffic light with fixed colours | named choices Python can check |
