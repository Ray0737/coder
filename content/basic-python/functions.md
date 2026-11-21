---
title: Functions
summary: Name a piece of code once, give it inputs, get a result back, and reuse it anywhere.
---

> [!aha] You already use functions: `print()`, `input()`, `len()`. Each one is a named job. Now you build your own, so a job you write once can be called a hundred times.

## def: write the recipe once

A function is a recipe card. You write the steps once under a name, then "cook" it whenever you like by calling the name. `def` starts the recipe, the names in brackets are the **parameters** (the ingredients it needs), and the indented lines are the steps.

```python
def print_pet(name, kind, age):
    print(f"{name} is a {kind}, {age} years old")

print_pet("Biscuit", "hamster", 2)      # call it
print_pet("Pepper", "parrot", 5)        # call it again
```

Writing `def` does **not** run anything. The code only runs when you call the function.

## Inputs go in, one value comes out

Put numbers in, get an answer out. The `return` word hands the answer back so you can store it or use it.

```widget
funcmachine
```

```python
def bmi_calculator(w, h):
    h = h / 100                 # cm to metres
    return w / (h ** 2)

bmi = bmi_calculator(60, 170)
print(f"Your BMI: {bmi:.2f}")
```

> [!warn] `print` and `return` are not the same. `print` only **shows** something on the screen. `return` gives the value **back to your code**. A function that only prints cannot be used in a sum, but a function that returns can: `bmi_calculator(60, 170) + 1`.

## Calling with names

You can pass values by position, or by name. With names the order does not matter.

```python
def describe_item(name, price):
    print(f"{name} costs {price} baht.")

describe_item("Notebook", 30)             # by position
describe_item(price=25, name="Pencil")    # by name
```

## Default values

Give a parameter a default and it becomes optional. If the caller leaves it out, the default is used.

```python
def greet(name="Guest"):
    return f"Hello, {name}!"

print(greet("Falcons"))     # Hello, Falcons!
print(greet())          # Hello, Guest!
```

## A function that decides

A function can hold a whole `if` ladder. This one is the four-function calculator from class.

```python
def calculator(n1, n2, op):
    if op == "+":
        return n1 + n2
    if op == "-":
        return n1 - n2
    if op == "*":
        return n1 * n2
    if op == "/":
        return n1 / n2

num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))
operator = input("Choose operator (+ - * /): ")
print(calculator(num1, num2, operator))
```

Passing a **list** into a function works the same. This one finds the smallest and biggest in a list, using the list skills from earlier:

```python
def find_max_min(nlist):
    ordered = sorted(nlist)
    return ordered[0], ordered[-1]      # two values come back as a tuple

low, high = find_max_min([4, 9, 1, 7])
print(f"Lowest = {low} | highest = {high}")
```

## Any number of arguments

Sometimes you do not know how many values will come in. Put one star before a parameter name and it collects all the extra positional values into a **tuple**. Put two stars before the name and it collects all the extra named values into a **dictionary**. The names `args` and `kwargs` are only a habit.

```python
def sum_all(*args):
    total = 0
    for num in args:
        total += num
    return total

print(sum_all(1, 2, 3, 4))      # 10

def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(city="London", population=9000000)
```

## lambda: a function with no name

A **lambda** is a one-line function you do not bother to name. It is handy for short jobs, especially with `map` and `filter`.

```python
add_one = lambda x: x + 1
print(add_one(5))                                   # 6

numbers = [1, 2, 3, 4, 5]
print(list(map(lambda x: x * x, numbers)))          # [1, 4, 9, 16, 25]
print(list(filter(lambda x: x % 2 == 0, numbers)))  # [2, 4]
```

`map` applies the function to every item, and `filter` keeps only the items for which the function says `True`.

> [!tip] If a function does more than one thing, split it. A function named `calculate_bmi` that also asks the user and prints the answer is hard to reuse. Let one function calculate, and let the main code ask and print.

## Handy tips

- **Describe your function.** A string in triple quotes as the first line is a **docstring**, and `help(greet)` shows it (example below).
- **Return many values.** `return low, high` hands back a tuple, and `low, high = f(...)` unpacks it.
- **Variables inside are private.** A variable made inside a function is **local** and vanishes when the function ends. Use `return` to get a value out. Avoid `global` unless you really must.
- **Never use an empty list as a default.** `def add(item, items=[])` keeps the **same list** between calls. Use `items=None` and make a new list inside.
- **A function that returns nothing gives `None`.** If you print the result and see `None`, you probably forgot `return`.
- **One job each.** If you cannot name a function without the word "and", split it in two.
- **Protect your starter code.** Wrap the part that runs the program in `if __name__ == "__main__":`. Then another file can `import` your functions without the program starting by itself.

```python
def greet(name):
    """Return a greeting for name."""     # the docstring
    return f"Hello, {name}!"

if __name__ == "__main__":                # runs only when this file is run directly
    print(greet("Falcons"))
```

## Try it

1. Write `double(x)` that returns `x * 2`, and print `double(21)`.
2. Write `greet(name, greeting="Hello")` and call it with and without the second value.
3. Write `is_even(n)` that returns `True` or `False`.
4. Write `average(*numbers)` that returns the mean of any amount of numbers.
5. Why does `x = print("hi")` leave `x` equal to `None`?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `def name(params):` | writing a recipe card | defines a reusable job |
| calling `name(args)` | cooking the recipe | runs it with real values |
| `return` | handing back the dish | sends a value to the caller |
| default value | a pre-filled form field | makes a parameter optional |
| args and kwargs | a bag that holds any amount | collects extra values |
| `lambda` | a sticky-note recipe | a short unnamed function |
