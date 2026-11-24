class Employee:
    def __init__(self) -> None:
        print("Default Constructor")
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary
    def edit_salary(self, name, salary):
        self.name = name
        self.salary = salary
    def showdata(self):
        print(f"Name: {self.name}")
        print(f"Salary: {self.salary}")
emp1 = Employee("John Doe", 50000)
emp1.showdata()
emp1.edit_salary("Jane Doe", 60000)
emp1.showdata()

class animal: 
    def showdata(self):
        print("Aomsin")

class fighterjet:
    def detail(self,x):
        self.name = "F22" and "Raptor"
        self.missile = "AIM-120" and "AIM-9"
        self.cannon = "M61A2"
        self.radarcrosssection = 0.001
        self.killcount= x
        print(f"Aircraft:{self.name}")
        print(f"Missile: {self.missile} ")
        print(f"Aircraft:{self.cannon}")
        print(f"Aircraft:{self.radarcrosssection}")
        print(f"Aircraft:{self.killcount}")

Raptor = fighterjet()
Raptor.detail(1)


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
    def play(self):
        self.hp -= 10
        self.money -= 10
        self.happiness += 20
    def showdata(self):
        print(f"HP: {self.hp}, Money: {self.money}, Happiness: {self.happiness}")
man1 = Businessman(100, 100, 100)
man1.showdata()
man1.work()
man1.showdata()
man1.sleep()
man1.showdata()
man1.play()

man1.showdata()

# ===== Encapsulation: a bank account =====
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance          # the underscore means: use the methods, not this directly

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self._balance += amount

    def withdraw(self, amount):
        if amount > self._balance:
            print("Not enough money")
            return
        self._balance -= amount

    def __str__(self):                   # what print(acc) shows
        return f"{self.owner}: {self._balance} baht"

acc = BankAccount("Ann", 100)
acc.deposit(50)
acc.withdraw(500)
acc.withdraw(30)
print(acc)


# ===== Inheritance: a pet, a dog and a cat =====
class Pet:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

    def intro(self):
        print(f"{self.name} says {self.speak()}")

class Dog(Pet):                          # a Dog is a Pet
    def speak(self):                     # replaces Pet.speak
        return "Woof"

class Cat(Pet):
    def __init__(self, name, indoor):
        super().__init__(name)           # let Pet store the name
        self.indoor = indoor

    def speak(self):
        return "Meow"

for pet in [Pet("Thing"), Dog("Rex"), Cat("Mimi", True)]:
    pet.intro()


# ===== Class attributes, @classmethod and @staticmethod =====
class Circle:
    pi = 3.14159                         # one value shared by every circle
    count = 0

    def __init__(self, r):
        self.r = r
        Circle.count += 1

    def area(self):
        return Circle.pi * self.r ** 2

    @classmethod
    def unit(cls):                       # a second way to build a Circle
        return cls(1)

    @staticmethod
    def is_valid(r):                     # needs neither self nor cls
        return r > 0

a = Circle(2)
b = Circle.unit()
print(round(a.area(), 2), round(b.area(), 2), Circle.count, Circle.is_valid(-1))


# ===== @property: a checked attribute =====
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius           # goes through the setter below

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("below absolute zero")
        self._celsius = value

    @property
    def fahrenheit(self):                # worked out when asked, never stored
        return self._celsius * 9 / 5 + 32

t = Temperature(25)
print(t.fahrenheit)
t.celsius = 100
print(t.fahrenheit)
try:
    t.celsius = -300
except ValueError as e:
    print("Error:", e)


# ===== Objects that hold objects =====
class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages

    def __repr__(self):                  # how the object looks inside a list
        return f"Book({self.title!r}, {self.pages})"

class Shelf:
    def __init__(self):
        self.books = []

    def add(self, book):
        self.books.append(book)
        return self                      # lets calls be chained

    def total_pages(self):
        return sum(b.pages for b in self.books)

    def __len__(self):                   # len(shelf) works
        return len(self.books)

shelf = Shelf()
shelf.add(Book("Python 101", 300)).add(Book("Robots", 120))
print(len(shelf), shelf.total_pages(), shelf.books)
