---
title: Conditionals
summary: Let the program choose a path with if, elif and else, based on a comparison.
---

> [!aha] Until now every line ran, top to bottom, every time. A **conditional** is a fork in the road: Python checks a question, and only the road whose answer is yes gets walked.

## True or False: the question

A condition is a yes-or-no question. Python answers it with a **boolean**: `True` or `False`. You build the question with a comparison.

| Symbol | Asks | Example | Result |
|---|---|---|---|
| `==` | equal to? | `5 == 5` | `True` |
| `!=` | not equal to? | `5 != 5` | `False` |
| `>` `<` | bigger / smaller? | `10 > 5` | `True` |
| `>=` `<=` | bigger or equal / smaller or equal? | `3 >= 4` | `False` |

> [!warn] One `=` **stores** a value (`age = 15`). Two `==` **ask** whether two values are equal (`age == 15`). Mixing them up is the most common beginner mistake.

You can join questions with `and`, `or` and `not`:

```python
print(5 > 3 and 2 > 1)     # True: both must be true
print(5 > 3 or 2 > 9)      # True: one is enough
print(not 5 > 3)           # False: flips the answer
```

## if, elif, else

`if` asks the first question. `elif` (else if) asks the next one only if the earlier ones failed. `else` catches everything left over. The lines that belong to each branch are **indented** by four spaces, and the colon `:` ends the question line.

```python
num = int(input("Enter an integer: "))
if num > 0:
    print(f"{num} is more than 0")
elif num == 0:
    print("It is zero")
else:
    print(f"{num} is less than 0")
```

## The ladder: only the first yes counts

Python reads an `if` / `elif` chain from the top and stops at the **first** question that is true. Everything below it is never checked. Drag the score and see where it stops. This is the grade rule from the class exercise.

```widget
gradeladder
```

```python
gpa = round(float(input("Enter the score (x/100): ")))
if gpa >= 80:
    print("Grade 4")
elif gpa >= 75:
    print("Grade 3.5")
elif gpa >= 70:
    print("Grade 3")
else:
    print("Grade 0")
```

> [!compare] Think of it like a bouncer checking a line of rules: "Over 80? Straight in. No? Over 75? Table 2. No? Over 70?" Once you are placed, the bouncer stops asking. That is why the **order** matters: put `>= 50` first and everyone above 50 would get Grade 1.

## A decision inside a decision

An `if` can sit inside another `if`. The inner question is only asked when the outer one was true. The member discount exercise works like this:

```python
member = input("Are you a member? (Yes/No): ")
if member == "Yes":
    bill = float(input("Enter your total bill: "))
    if bill >= 5000:
        discount = bill * 0.15
    elif bill >= 1000:
        discount = bill * 0.10
    else:
        discount = bill * 0.05
    print(f"Discount = {discount} THB, you pay {bill - discount} THB")
else:
    print("No discount")
```

## Check before you convert

Remember that `int("abc")` crashes. Text has its own yes-or-no questions you can ask first:

```python
text = input("Enter your age: ")
if text.isdigit():                  # only digits 0-9?
    print(int(text) + 1)
else:
    print("Please type a whole number")
```

| Question | True when |
|---|---|
| `s.isdigit()` | the text is only digits, such as `"12345"` |
| `s.isalpha()` | the text is only letters, such as `"Python"` |
| `s.isalnum()` | letters and digits only |
| `s.isupper()` / `s.islower()` | all the letters are capitals / small |

## Math you will need: // and %

Two operators are very useful in conditions. `//` is **floor division** (how many whole times does it fit) and `%` is the **remainder**. The banknote exercise uses both: `withdraw % 100 == 0` checks the amount is a multiple of 100, and `//` counts the notes.

```python
withdraw = 2700
print(withdraw // 1000)     # 2 notes of 1000
withdraw = withdraw % 1000  # 700 left
print(withdraw // 500)      # 1 note of 500
withdraw = withdraw % 500   # 200 left
print(withdraw // 100)      # 2 notes of 100
```

## Handy tips

- **Chain a comparison.** `18 <= age < 65` is allowed and reads like maths. It is the same as `age >= 18 and age < 65`.
- **Empty means False.** `0`, `""`, `[]` and `None` all count as `False`, so `if my_list:` means "if the list has something in it".
- **One-line choice.** `label = "adult" if age >= 18 else "minor"` picks one of two values in a single line.
- **`elif` or separate `if`s?** An `elif` chain stops at the first match. Separate `if` lines each get checked, so use them when more than one thing can be true at once.
- **Match text safely.** `answer.strip().lower() == "yes"` accepts `"Yes"`, `"YES"` and `" yes "`.
- **Check decimals with care.** `0.1 + 0.2 == 0.3` is `False` because of tiny rounding errors. Compare with `round(0.1 + 0.2, 2) == 0.3` instead.
- **Test the edges.** Try the exact boundary values, such as 50, 80 and 100 in the grade ladder, and a bad input. Most bugs hide there.

## Try it

1. Ask for a number. Print whether it is positive, negative or zero.
2. Ask for a width and a length. Print the area only if both are above 0, otherwise print a warning.
3. Ask for a temperature in Fahrenheit. If it is 32 or more, print it in Celsius with `C = (F - 32) * 5 / 9`.
4. A car park is free for the first hour and costs 30 THB per hour after that. Ask how many hours and print the bill.
5. Swap the order of two branches in the grade ladder. What goes wrong?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `==` `!=` `>` `<` | a yes-or-no question | gives `True` or `False` |
| `and` `or` `not` | joining questions | combines conditions |
| `if` | a fork in the road | runs a block only when true |
| `elif` | the next question | tried only if earlier ones failed |
| `else` | the default road | runs when nothing else did |
| `//` and `%` | whole notes and the change left over | quotient and remainder |
