---
title: Tkinter GUI
summary: Build a window with labels and buttons, place them, and make the program react when you click.
---

> [!aha] Until now a program ran top to bottom and ended. A window program is different: it opens, then **waits** for you to click something, and reacts. That style is called **event-driven**, like a shop assistant who waits for a customer to ring the bell.

## Tkinter comes with Python

**Tkinter** is Python's built-in toolkit for windows, buttons and text boxes. There is nothing to install on Windows or macOS. On Linux it may be a separate package: `sudo apt install python3-tk`. It needs a screen, so it will not open on a machine with no display.

> [!more] TLDR: Tkinter
> Tkinter is Python's built-in window toolkit. It needs a screen, so it will not open on a plain terminal.

## The smallest window

Five lines make a window, and `mainloop()` is the waiting part. It goes **last**, because nothing after it runs until the window closes. `tk.Tk()` creates the window, `title` and `geometry` set its title bar, size and position, and `configure(bg=...)` sets the background colour.

```python
import tkinter as tk

root = tk.Tk()                       # create the window
root.title("HOMEWORK-GUI")           # text in the title bar
root.geometry("400x300+200+200")     # width x height + x + y on the screen
root.configure(bg="#C0BCBD")         # background colour

root.mainloop()                      # stay open until closed
```

> [!more] TLDR: the smallest window
> `tk.Tk()` makes the window and `mainloop()` keeps it open. `mainloop()` always goes last.

## Widgets: the things in a window

A **widget** is one piece of the window. The window is the wall, and widgets are what you stick on it.

| Widget | What it is |
|---|---|
| `tk.Label` | text (or a picture) that you read |
| `tk.Button` | something you click |
| `tk.Entry` | a one-line box to type in |
| `tk.Frame` | an invisible box to group other widgets |
| `ttk.Treeview` | a table with rows |
| `ttk.Combobox` | a drop-down list |

> [!more] TLDR: widgets
> A widget is one piece of the window, such as a `Label`, `Button` or `Entry`.

## Making a widget

Creating a widget does not show it. You must also **place** it, and the next section shows how.

```python
label1 = tk.Label(text="Team: Falcons", fg="black", font=("Arial", "10"), bg="#FFC107")
```

> [!more] TLDR: making a widget
> `tk.Label(root, text=...)` creates a widget, but it does not appear until you place it.

## Three ways to place a widget

There are three layout methods, and the table says which one suits which job.

| Method | How it positions | Best for |
|---|---|---|
| `.place(x, y, width, height)` | exact pixel position | posters and fixed layouts |
| `.pack()` | stacks one after another | simple vertical or horizontal lists |
| `.grid(row, column)` | rows and columns, like a table | forms and button panels |

> [!more] TLDR: placing widgets
> `pack` stacks, `grid` uses rows and columns and `place` uses pixels. Do not mix `pack` and `grid` in one parent.

## Placing with place()

With `place` the top-left corner of the window is (0, 0), and you give the size and position of each widget in pixels.

```python
label1.place(height=35, width=400, x=0, y=0)       # top-left corner is (0, 0)
label3.place(height=95, width=95, x=0, y=70)
```

> [!warn] Do not mix `pack` and `grid` inside the same window or frame. Tkinter cannot decide which to obey and the program may freeze. Pick one per container.

> [!more] TLDR: place()
> `place(x=, y=)` puts a widget at exact pixels from the top-left corner (0, 0).

## Buttons and events

A button takes a **command**: the function to run when it is clicked. Give just the function **name**, with no brackets. With brackets Python runs it at once, not on click. `command=hello` hands the function itself to the button, with no brackets, so it runs on each click rather than once at the start.

```python
def hello():
    print("clicked")

tk.Button(root, text="Click me", command=hello).pack()
```

> [!more] TLDR: buttons
> `command=hello` gives the button the function itself, and Tkinter calls it when the button is clicked. Write the name with no brackets: `command=hello()` would run the function immediately, at the start, and pass its result to the button. The function can change other widgets, for example by calling `label.config(text=...)`.

## Passing a value to a button

To pass a value to the function, wrap the call in a `lambda`, which delays it until the click.

```python
tk.Button(root, text="Matcha", command=lambda: count_order("Matcha")).pack()
```

> [!more] TLDR: passing a value
> Wrap the call in `lambda: f(value)` so it waits for the click.

## Putting it together: a cafe order screen

The class exercise is an ordering screen. Each button adds one to a counter kept in a **dictionary**, and Submit builds a receipt from it. The data lives in two dictionaries, the prices and the counts, and every click changes the counts. Try it.

```widget
cafeorder
```

> [!more] TLDR: the cafe screen
> A dictionary keeps the counts, each click changes it and a button builds the receipt.

## The cafe code

This is where the earlier chapters pay off: a **dictionary** for the data, a **loop** over `.items()`, an **if** to skip unordered items, and **functions** for each click. The two dictionaries hold the prices and how many of each drink were ordered. `count_order` adds one to an item and updates the button's text, and `order_cost` loops over `count.items()`, skips items with a quantity of 0, builds a receipt line for each, adds up the total and shows it in a pop-up.

```python
price = {"Thai Tea": 40, "Milk Tea": 35, "Matcha": 60, "Drip Coffee": 30}
count = {"Thai Tea": 0, "Milk Tea": 0, "Matcha": 0, "Drip Coffee": 0}

def count_order(item):
    count[item] += 1                          # one more of this item
    button.config(text=f"{item} ({count[item]})")

def order_cost():
    total = 0
    receipt = "--- Your Order ---\n"
    for item, quantity in count.items():
        if quantity > 0:
            cost = price[item] * quantity
            receipt += f"{item}: {quantity} x {price[item]} THB = {cost} THB\n"
            total += cost
    receipt += f"--- Total: {total} THB ---"
    messagebox.showinfo("Order Receipt", receipt)
```

> [!more] TLDR: the cafe code
> A dictionary, a loop over `.items()`, an `if` and a function per click, all from earlier chapters.

## Pop-up messages

`messagebox` shows a small dialog. It needs its own import: The three calls show a message in a small dialog: `showinfo` for plain information, `showwarning` for a caution and `showerror` for a failure. The first text is the title bar and the second is the message.

```python
from tkinter import messagebox

messagebox.showinfo("Title", "Everything is fine")
messagebox.showwarning("Careful", "Task field cannot be empty.")
messagebox.showerror("Error", "Failed to save data")
```

> [!more] TLDR: pop-ups
> `messagebox.showinfo`, `showwarning` and `showerror` open a small dialog.

## A live clock with after()

`after(milliseconds, function)` asks Tkinter to run a function later. If that function asks `after` again, it repeats, which makes a clock. Do **not** use `while True` or `time.sleep` in a window program, because they freeze the window. In the code, `update_clock` reads the time as text, writes it into the label, and then asks `after(1000, ...)` to call itself again in one second, which keeps the clock ticking without freezing the window.

```python
from datetime import datetime

def update_clock(clock_label):
    now = datetime.now().strftime("%H:%M:%S")
    clock_label.config(text=now)
    clock_label.after(1000, update_clock, clock_label)    # run again in 1 second

clock_label = tk.Label(root)
clock_label.pack()
update_clock(clock_label)
```

> [!more] TLDR: after()
> `root.after(1000, tick)` asks Tkinter to call `tick` once, a second from now. If `tick` calls `after` again at its end, it repeats, and that is how a live clock works. `time.sleep()` and `while True` freeze the whole window, because the window can only respond when the program returns to the main loop.

## Pictures on buttons

`PhotoImage` loads a picture for a button. The picture file must exist at that path, or the program crashes with a `TclError` when it starts. Also keep the image in a variable that stays alive, or Tkinter may drop it. In the button below, `compound="top"` puts the picture above the text.

```python
pic1 = tk.PhotoImage(file="pic/1.png")
button1 = tk.Button(root, text="Thai Tea 40THB", image=pic1, compound="top")
button1.grid(row=3, column=1, padx=10, pady=10)
```

> [!more] TLDR: pictures
> `PhotoImage` loads a picture. The file must exist, and the image must be kept in a variable.

## Handy tips

- **Read a text box.** `entry.get()` returns the typed text, as a string. Convert with `int(entry.get())` for numbers, and check it first, because an empty box crashes `int()`.
- **Clear and set a text box.** `entry.delete(0, tk.END)` empties it, and `entry.insert(0, "text")` fills it.
- **Change a widget later.** `label.config(text="new")` updates it. You can also change `bg`, `fg` and `state="disabled"`.
- **Lock the window size.** `root.resizable(False, False)` stops the user dragging it, which protects a `place()` layout.
- **Close the window from code.** `root.destroy()`. After `mainloop()` ends, the rest of the script continues.
- **Spread across columns.** `grid(row=0, column=0, columnspan=2)` makes a widget wide, and `padx` and `pady` add breathing room.
- **Keep widgets you need later.** A widget created inside a function is gone when the function ends. Use `global`, or keep them in a class, as the planner program does.
- **Do not block the window.** Long loops, `input()` and `time.sleep()` freeze it. Use `after()` for repeating work, and `Entry` boxes instead of `input()`.
- **Listen for keys.** `root.bind("<Return>", func)` runs `func` when Enter is pressed. The function receives an `event` argument.
- **Find the cause of a crash.** If you see `TclError: image "pyimage1" doesn't exist`, the picture file is missing or was not kept in a variable. `TclError: can't invoke "grid" command` usually means you mixed `pack` and `grid`.

## Try it

1. Open a window 300 by 200 with a title and a coloured background.
2. Add a label that says your name and a button that prints "hello" when clicked.
3. Use `.grid` to make a row of three buttons labelled 1, 2 and 3.
4. Add a label that shows a counter, and a button that adds one to it each click.
5. Why must `command=hello` have no brackets?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `tk.Tk()` | the wall | creates the window |
| `mainloop()` | waiting at the counter | keeps the window open and listening |
| `Label` / `Button` / `Entry` | posters, bells, notepads | the pieces inside a window |
| `place` / `pack` / `grid` | pins, a stack, a table | where each piece goes |
| `command=` | what the bell does | the function a click runs |
| `after(ms, f)` | an alarm clock | runs a function later, again and again |
| `messagebox` | a pop-up note | shows information or a warning |
