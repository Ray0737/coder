---
title: Printing and getting input
summary: Make Python talk, ask the user a question, and turn the answer into a number.
---

> [!aha] A program is a conversation. `print()` is Python speaking and `input()` is Python listening. Everything in this chapter is just those two things.

## print(): Python speaks

Think of `print()` as the display board in a shop. You decide what goes on the board, and everybody who walks past can read it. Put text in quotes and Python shows it on the screen.

```python
print("Hello, world")
print("My name is Mint")
```

Each `print()` starts a new line. Numbers do not need quotes.

```python
print(42)
print(3.14)
print("Total:", 42)
```

Text in quotes is called a **string**. `"42"` is text that looks like a number, and `42` is a real number. They behave differently, and you will see why soon.

## Variables: labelled boxes

A variable is a lunchbox with a label on the lid. The label is the **name** and whatever is inside is the **value**. You can swap what is inside, and the label stays the same.

| In real life | In Python |
|---|---|
| A box labelled `snack` holds a banana | `snack = "banana"` |
| You open the box labelled `snack` | `print(snack)` |
| You put an apple in the same box | `snack = "apple"` |

## f-strings: a form letter with blanks

An f-string is a form letter: "Dear ____, you scored ____ points." The blanks are the `{ }`, and Python fills each one from the variable with that name. Put an `f` before the quote and wrap each variable in `{ }`.

```python
name = "Mint"
score = 95
print(f"{name} scored {score} points")
```

Change the blanks and watch the sentence change:

```widget
fstring
```

You will also see an older style that uses `%`. It does the same job and appears in older code. Use f-strings when you write new code, because they are shorter and easier to read.

```python
print("%s scored %d points" % (name, score))
```

## input(): Python listens

`input()` is a cashier asking "How many would you like?" and then waiting for your answer. It shows a question, waits for the user to type, and gives you back what they typed.

```python
name = input("What is your name? ")
print(f"Nice to meet you, {name}")
```

The text inside the brackets is the question. Leave a space at the end so the answer does not touch it.

## The catch: input() always gives text

> [!aha] When you fill in a paper form, the number you write is only *ink* until somebody reads it as a number. `input()` hands you the ink. `int()` is you reading it as a number.

This is the mistake almost everyone makes once. `input()` returns a **string**, even when the user types a number.

```python
age = input("How old are you? ")
print(age + 1)        # this crashes
```

Python cannot add a number to text. Type into the box and see for yourself:

```widget
inputtype
```

Turn the text into a number first. Use `int()` for whole numbers, such as ages and scores, and `float()` for decimals, such as heights and prices.

```python
age = int(input("How old are you? "))
print(f"Next year you will be {age + 1}")

height = float(input("Height in metres: "))
print(f"Double your height is {height * 2}")
```

If the user types something that is not a number, such as `abc`, `int()` stops with an error. You will learn how to handle that later in the course.

## type(): the label on a parcel

`type()` is the label on a parcel: *fragile*, *liquid*, *this way up*. It does not change the parcel. It just tells you what you are holding. When something behaves strangely, print its type. It is the fastest way to catch a string where you expected a number.

```python
value = input("Type a number: ")
print(type(value))            # <class 'str'>

value = int(value)
print(type(value))            # <class 'int'>
```

## math: borrow a tool

A **module** is a toolbox in the garage. You do not carry every tool around all day. You `import` the toolbox when you need it, and the `math` module has maths helpers.

```python
import math

radius = float(input("Radius: "))
area = math.pi * radius ** 2
print(f"Area = {area:.2f}")
print(f"Square root of 49 = {math.sqrt(49)}")
```

`{area:.2f}` rounds to 2 decimal places. `**` means "to the power of".

## Try it

1. Ask for the user's name and favourite number. Print a sentence that uses both.
2. Ask for two numbers and print their sum, difference and product.
3. Ask for the radius of a circle. Print its area and its circumference, both rounded to 2 decimal places.
4. Ask for a temperature in Celsius and print it in Fahrenheit. The rule is `F = C * 9 / 5 + 32`.

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `print()` | a shop display board | shows something |
| `input()` | a cashier asking and waiting | asks, and returns text |
| `int()` / `float()` | reading ink as a number | text to number |
| `type()` | the label on a parcel | tells you what you have |
| `import math` | a toolbox from the garage | gives you `math.pi`, `math.sqrt()` and more |
