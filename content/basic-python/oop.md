---
title: OOP
summary: Bundle data and the actions on it into one object, then build new classes from old ones.
---

> [!aha] So far, data sits in variables and the actions sit in functions, in separate places. **Object-oriented programming** (OOP) puts them together: a thing that knows its own facts and knows what it can do.

## Class and object: a blueprint and a house

A **class** is the blueprint, and an **object** is a house built from it. One blueprint can build many houses, and each house has its own paint colour. In Python, the blueprint describes what facts each object keeps (**attributes**) and what it can do (**methods**). In the code, `class Phone:` starts the blueprint, `__init__` stores the brand and price on the new object, and `showdata` prints them. `Phone("Nova", 12000)` builds one phone object, and `phone1.showdata()` asks that object to print its own data.

```python
class Phone:
    def __init__(self, brand, price):
        self.brand = brand
        self.price = price

    def showdata(self):
        print(f"Brand: {self.brand}")
        print(f"Price: {self.price}")

phone1 = Phone("Nova", 12000)
phone1.showdata()
```

## Reading the constructor

Three things in the code above are worth noticing.

- `__init__` is the **constructor**. Python calls it automatically when you write `Phone(...)`, and it sets up the object's first facts.
- `self` means "this very object". `self.brand = brand` stores the brand inside this object.
- Every method takes `self` as its first parameter. You do not pass it yourself: `phone1.showdata()` hands `phone1` in for you.

## Methods change the object

A method can change the facts the object keeps. Here a businessman has `hp`, `money` and `happiness`, and each action changes them. Call the methods and watch the numbers.

```widget
objectviz
```

## The Businessman class

This is the class behind the diagram, with one method for each button. The class keeps three numbers: `work` lowers HP and happiness and raises money, `sleep` does the opposite, and `showdata` prints all three. The object `man1` starts at 100 each, and after one `work()` it shows HP 90, Money 110 and Happiness 80.

```python
class Businessman:
    def __init__(self, hp, money, happiness):
        self.hp = hp
        self.money = money
        self.happiness = happiness

    def work(self):
        self.hp -= 10
        self.money += 10
        self.happiness -= 20

    def sleep(self):
        self.hp += 20
        self.money -= 10
        self.happiness += 10

    def showdata(self):
        print(f"HP: {self.hp}, Money: {self.money}, Happiness: {self.happiness}")

man1 = Businessman(100, 100, 100)
man1.work()
man1.showdata()       # HP: 90, Money: 110, Happiness: 80
```

> [!compare] Think of it like a game character. A character has stats (HP, gold) and abilities (attack, rest). The stats are the **attributes**, the abilities are the **methods**, and each player's character is a separate **object** with its own numbers.

## Many objects, one class

Because each object keeps its own data, two objects never interfere with each other. `man1` and `man2` are two separate objects built from the same class with different starting numbers. Calling `work()` on `man1` changes only `man1`, so `man2.showdata()` still shows its original values.

```python
man1 = Businessman(100, 100, 100)
man2 = Businessman(50, 500, 10)
man1.work()
man1.showdata()       # changed
man2.showdata()       # untouched
```

## A class attribute

A **class attribute** is shared by every object. It is written directly inside the class, not in `__init__`. `species` is written inside the class but outside `__init__`, so every `Dog` shares it, while `name` and `age` are set per dog with `self`. `bark` is a method that returns a sentence using that dog's own name.

```python
class Dog:
    species = "Canis familiaris"       # shared by all dogs

    def __init__(self, name, age):
        self.name = name               # different for each dog
        self.age = age

    def bark(self):
        return f"{self.name} says Woof!"
```

## Inheritance: a new class from an old one

A new class can **inherit** everything from an existing one and then add or change things. Think of a child who has the parent's features but learns new tricks. The child is written with the parent's name in brackets. In the code, `GoldenRetriever(Dog)` inherits from `Dog`. Its `__init__` calls `super().__init__` to let `Dog` set the name and age and then adds its own `color`, it overrides `bark` with a different sentence, and it adds a new `retrieve` method. `goldie.species` still works because it is inherited.

```python
class GoldenRetriever(Dog):
    def __init__(self, name, age, color):
        super().__init__(name, age)    # let Dog set up name and age
        self.color = color

    def bark(self):                    # overriding: same name, new behaviour
        return f"{self.name} says Yelp!"

    def retrieve(self, item):
        return f"{self.name} retrieved the {item}!"

goldie = GoldenRetriever("Biscuit", 2, "golden")
print(goldie.bark())          # Biscuit says Yelp!   (the new version)
print(goldie.retrieve("ball"))
print(goldie.species)         # inherited from Dog
```

## super() and overriding

Two ideas make inheritance work.

- `super()` means "my parent class", so `super().__init__(...)` runs the parent's setup first.
- **Overriding** means the child writes a method with the same name as the parent's. The child's version wins. The same call, `bark()`, behaves differently depending on which object it is used on. That is called **polymorphism**.

## Encapsulation: keep some things private

Sometimes you do not want other code to change a value directly. Two underscores at the front of a name mark it as private, and you give the outside world a method to use instead. A bank does not let you reach into the vault. You ask the teller (`deposit`), and the teller checks the rules first, which is why the check `amount > 0` sits inside the method.

```python
class Account:
    def __init__(self, balance):
        self.__balance = balance

    def get_balance(self):
        return self.__balance

    def deposit(self, amount):
        if amount > 0:                 # the rule lives in one place
            self.__balance += amount

acc = Account(100)
acc.deposit(50)
print(acc.get_balance())      # 150
# acc.__balance               # AttributeError: it is hidden
```

## The four ideas in one table

| Idea | Meaning | In the examples |
|---|---|---|
| Encapsulation | keep data and its rules together, hide the inside | `__balance` and `deposit()` |
| Inheritance | build a new class from an old one | `GoldenRetriever(Dog)` |
| Polymorphism | the same call acts differently on different objects | `bark()` on `Dog` and `GoldenRetriever` |
| Abstraction | show what it does, hide how | calling `work()` without knowing the maths inside |

## Handy tips

- **Make objects print nicely.** Add a `__str__` method and `print(obj)` shows your text instead of something like `<__main__.Phone object at 0x...>` (example below).
- **Class names use CapWords.** `GoldenRetriever`, not `golden_retriever`. Variables and methods use lowercase with underscores.
- **Forgot `self`?** Two errors give it away: `TypeError: showdata() takes 0 positional arguments but 1 was given` means the method is missing `self` in its definition, and `NameError: name 'brand' is not defined` means you wrote `brand` instead of `self.brand`.
- **Check what something is.** `isinstance(goldie, Dog)` is `True` for a child class too.
- **Do not copy by assigning.** `p2 = phone1` is the same object under another name. Make a new one with `Phone(...)`.
- **When to use a class.** If you keep passing the same three or four variables to many functions, they probably belong together in a class.
- **`dir(obj)` lists everything an object can do.**

```python
class Phone:
    def __init__(self, brand, price):
        self.brand = brand
        self.price = price

    def __str__(self):                     # what print() shows
        return f"{self.brand}, {self.price} baht"

print(Phone("Nova", 12000))                # Nova, 12000 baht
```

## Try it

1. Write a `Book` class with `title` and `pages`, and a method `showdata()`.
2. Add a method `edit_pages(new_pages)` and use it on an object.
3. Make two books and change only one. Print both.
4. Write a `Cat` class that inherits from `Animal` and overrides `speak()`.
5. Why does a method need `self` as its first parameter?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `class` | a house blueprint | describes attributes and methods |
| object | a house built from it | one real thing with its own data |
| `__init__` | filling in the form at birth | sets up a new object |
| `self` | "this one" | the object a method works on |
| inheritance | a child with the parent's traits | reuse and extend a class |
| `super()` | asking the parent | calls the parent's version |
| `__private` | the bank vault | hides a value behind methods |
