---
title: Printing and getting input
summary: Make Python talk, ask the user a question, and turn the answer into a number.
---

> [!aha] A program is a conversation. `print()` is Python speaking and `input()` is Python listening. Everything in this chapter is just those two things.

## print(): Python speaks

Think of `print()` as the display board in a shop. You decide what goes on the board, and everybody who walks past can read it. Put text in quotes and Python shows it on the screen, and each `print()` starts a new line.

```python
print("Hello, world")
print("My favourite fruit is mango")
```

## Numbers and strings

Numbers do not need quotes. Text in quotes is called a **string**, and `"42"` is text that looks like a number while `42` is a real number. They behave differently, and you will see why soon.

```python
print(42)
print(3.14)
print("Total:", 42)
```

## Variables: labelled boxes

A variable is a lunchbox with a label on the lid. The label is the **name** and whatever is inside is the **value**. You can swap what is inside, and the label stays the same.

| In real life | In Python |
|---|---|
| A box labelled `snack` holds a banana | `snack = "banana"` |
| You open the box labelled `snack` | `print(snack)` |
| You put an apple in the same box | `snack = "apple"` |

## f-strings: a form letter with blanks

An f-string is a form letter: "Dear ____, you scored ____ points." The blanks are the `{ }`, and Python fills each one from the variable with that name. Put an `f` before the quote and wrap each variable in `{ }`, then change the blanks in the diagram below and watch the sentence change.

```python
name = "Falcons"
score = 95
print(f"{name} scored {score} points")
```

```widget
fstring
```

## The older % way

Before f-strings, Python had two other ways to fill the blanks. You will meet them in older code and in many tutorials, so it helps to recognise them, but use f-strings when you write new code because they are shorter and easier to read. The `%` way puts a code where each blank goes, and the code says what kind of value belongs there.

| Code | Fills the blank with | Example |
|---|---|---|
| `%s` | text (a string) | `"%s" % "Falcons"` gives Falcons |
| `%d` | a whole number | `"%d" % 95` gives 95 |
| `%f` | a decimal number | `"%f" % 3.5` gives 3.500000 |
| `%.2f` | a decimal rounded to 2 places | `"%.2f" % 3.14159` gives 3.14 |

## Using the % way

Give the values after a `%`, in the same order as the blanks. With more than one value, put them in brackets. If the code does not match the value, for example `%d` with text, Python stops with an error. The first value fills the first code and the second fills the second, so the order matters. Here `%s` takes the text, `%d` takes the whole number, and `%.2f` rounds 87.456 to 87.46.

```python
name = "Falcons"
score = 95
print("%s scored %d points" % (name, score))
print("Average: %.2f" % 87.456)      # Average: 87.46
```

## The .format() way

The blanks are `{ }` again, but the values come afterwards inside `.format()`. All three styles print the same sentence, and the only difference is where the values sit: inside the text for f-strings, after a `%` for the old style, and inside `.format()` for this one.

```python
print("{} scored {} points".format(name, score))
print("{0} scored {1} points".format(name, score))
print("Average: {:.2f}".format(87.456))
```

## input(): Python listens

`input()` is a cashier asking "How many would you like?" and then waiting for your answer. It shows a question, waits for the user to type, and gives you back what they typed. The text inside the brackets is the question, and you should leave a space at the end so the answer does not touch it.

```python
name = input("What is your name? ")
print(f"Nice to meet you, {name}")
```

## The catch: input() always gives text

> [!aha] When you fill in a paper form, the number you write is only *ink* until somebody reads it as a number. `input()` hands you the ink. `int()` is you reading it as a number.

This is the mistake almost everyone makes once. `input()` returns a **string**, even when the user types a number, and Python cannot add a number to text.

```python
age = input("How old are you? ")
print(age + 1)        # this crashes
```

## See it happen

Type into the box and see for yourself what each line does with your text.

```widget
inputtype
```

## Fix it with int() and float()

Turn the text into a number first. Use `int()` for whole numbers, such as ages and scores, and `float()` for decimals, such as heights and prices. If the user types something that is not a number, such as `abc`, `int()` stops with an error, and you will learn how to handle that later in the course.

```python
age = int(input("How old are you? "))
print(f"Next year you will be {age + 1}")

height = float(input("Height in metres: "))
print(f"Double your height is {height * 2}")
```

## type(): the label on a parcel

`type()` is the label on a parcel: *fragile*, *liquid*, *this way up*. It does not change the parcel. It just tells you what you are holding. When something behaves strangely, print its type. It is the fastest way to catch a string where you expected a number. In the code, `input()` gives a string, so the first `type()` prints `<class 'str'>`. After `int(value)` the same name holds a number and prints `<class 'int'>`, because casting does not change the old value but makes a new one that you store back.

```python
value = input("Type a number: ")
print(type(value))            # <class 'str'>

value = int(value)
print(type(value))            # <class 'int'>
```

## The basic data types

Every value has a **type**, and `type()` tells you which. These are the built-in single-value types.

| Type | What it holds | Example |
|---|---|---|
| `int` | a whole number | `30`, `-4` |
| `float` | a number with a decimal point | `3.14`, `1.75` |
| `str` | text | `"Hello"` |
| `bool` | `True` or `False` (capital first letter) | `is_student = True` |
| `NoneType` | "nothing here yet", written `None` | `result = None` |
| `complex` | a number with an imaginary part (rare) | `2 + 3j` |

> [!tip] Single values are only half the story. The types that hold **many** values, such as lists, tuples, dictionaries and sets, come in the next chapters, and the Tuples and dicts chapter compares them in one table.

## Casting: switching types

Switching a value from one type to another is called **casting**. Each line converts one value: `float(10)` adds a decimal point, `int(3.9)` cuts off the decimals without rounding, `int("123")` turns text into a number, `str(456)` turns a number into text, and `bool(0)` is False because zero and empty text count as false.

```python
print(float(10))      # 10.0
print(int(3.9))       # 3, it cuts off the decimals and does not round
print(int("123"))     # 123, text to number
print(str(456))       # "456", number to text
print(bool(0))        # False, 0 and "" count as False
```

## math: borrow a tool

A **module** is a toolbox in the garage. You do not carry every tool around all day. You `import` the toolbox when you need it, and the `math` module has maths helpers. In the code, `{area:.2f}` rounds to 2 decimal places and `**` means "to the power of". Line by line, `import math` opens the toolbox, `float(input(...))` reads the radius as a decimal, `math.pi * radius ** 2` is the circle area formula πr², and the f-string prints it rounded to 2 places.

```python
import math

radius = float(input("Radius: "))
area = math.pi * radius ** 2
print(f"Area = {area:.2f}")
print(f"Square root of 49 = {math.sqrt(49)}")
```

## Handy tips

- **Control the line ending and the gap.** `print("a", "b", sep="-")` shows `a-b`, and `print("loading", end="...")` stays on the same line.
- **Special characters.** `\n` starts a new line, `\t` is a tab, and `\"` puts a quote inside a quote. Three quotes, `"""like this"""`, let a string run over many lines.
- **Format numbers inside an f-string.** `{price:.2f}` gives two decimals, `{n:,}` adds thousands commas (`1,234,567`), and `{name:>10}` pads to 10 characters, right aligned.
- **Quick debugging.** `print(f"{score = }")` prints `score = 95`, so you see the name and the value together.
- **Clean up the typed text.** `input().strip()` removes stray spaces at both ends, and `.lower()` makes `"Yes"` and `"yes"` match.
- **Comments are for you.** Anything after `#` is ignored. Explain *why* you did something, not what the line plainly says.
- **Read the last line of an error first.** Python prints the kind of error and the line number at the bottom, such as `NameError: name 'x' is not defined`. That line usually tells you the whole problem.

## Try it

1. Ask for the user's name and favourite number. Print a sentence that uses both.
2. Ask for two numbers and print their sum, difference and product.
3. Ask for the radius of a circle. Print its area and its circumference, both rounded to 2 decimal places.
4. Ask for a temperature in Celsius and print it in Fahrenheit. The rule is `F = C * 9 / 5 + 32`.

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `print()` | a shop display board | shows something |
| `%s` `%d` `%.2f` and `.format()` | older form letters | fill the blanks the old way |
| `input()` | a cashier asking and waiting | asks, and returns text |
| `int()` / `float()` | reading ink as a number | text to number |
| `type()` | the label on a parcel | tells you what you have |
| `int` `float` `str` `bool` `None` | kinds of parcel | the basic types of a single value |
| `import math` | a toolbox from the garage | gives you `math.pi`, `math.sqrt()` and more |
