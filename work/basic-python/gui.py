# Tkinter tutorial: nine small windows, one after another.
# Close each window to see the next one.
import tkinter as tk
from tkinter import messagebox

# ===== 1. A window =====
root = tk.Tk()                       # the main window
root.title("Step 1: a window")
root.geometry("320x160+200+200")     # width x height + x + y on the screen
root.configure(bg="#E8EAF6")
root.mainloop()                      # keeps the window open until it is closed

# ===== 2. Labels: text you read =====
root = tk.Tk()
root.title("Step 2: labels")
root.geometry("320x160")

tk.Label(root, text="Hello, Tkinter").pack()
tk.Label(root, text="Big and blue", font=("Arial", 18), fg="#3949AB").pack()
tk.Label(root, text="On a yellow strip", bg="#FFF59D").pack(fill="x", pady=8)
root.mainloop()

# ===== 3. A button and a function =====
root = tk.Tk()
root.title("Step 3: a button")
root.geometry("320x160")

count = 0
label = tk.Label(root, text="Clicks: 0", font=("Arial", 16))
label.pack(pady=15)

def add_one():
    global count
    count += 1
    label.config(text=f"Clicks: {count}")    # change a widget after it exists

tk.Button(root, text="Click me", command=add_one).pack()   # no () after add_one
root.mainloop()

# ===== 4. An entry: typing =====
root = tk.Tk()
root.title("Step 4: an entry")
root.geometry("320x160")

name = tk.Entry(root, width=24)
name.pack(pady=12)
greeting = tk.Label(root, text="")
greeting.pack()

def greet():
    text = name.get().strip()                # read what was typed
    greeting.config(text=f"Hello, {text}!" if text else "Type a name first")

tk.Button(root, text="Greet", command=greet).pack(pady=6)
root.mainloop()

# ===== 5. Layout: pack and grid =====
root = tk.Tk()
root.title("Step 5: layout")

top = tk.Frame(root, bg="#C5CAE9")           # a frame groups widgets
top.pack(fill="x")
tk.Label(top, text="pack(): top to bottom", bg="#C5CAE9").pack(padx=10, pady=6)

form = tk.Frame(root)
form.pack(padx=10, pady=10)
tk.Label(form, text="Name").grid(row=0, column=0, sticky="e")
tk.Entry(form).grid(row=0, column=1, padx=6, pady=3)
tk.Label(form, text="Age").grid(row=1, column=0, sticky="e")
tk.Entry(form, width=6).grid(row=1, column=1, sticky="w", padx=6, pady=3)
tk.Button(form, text="Save").grid(row=2, column=0, columnspan=2, pady=6)
root.mainloop()

# ===== 6. Check boxes and radio buttons =====
root = tk.Tk()
root.title("Step 6: choices")
root.geometry("320x200")

milk = tk.BooleanVar()                       # a variable that a widget keeps up to date
size = tk.StringVar(value="Small")
result = tk.Label(root, text="")

def show():
    result.config(text=f"{size.get()} coffee{', with milk' if milk.get() else ''}")

tk.Checkbutton(root, text="Milk", variable=milk, command=show).pack(anchor="w", padx=12, pady=(10, 0))
for s in ("Small", "Medium", "Large"):
    tk.Radiobutton(root, text=s, value=s, variable=size, command=show).pack(anchor="w", padx=12)
result.pack(pady=10)
show()
root.mainloop()

# ===== 7. A list and a slider =====
root = tk.Tk()
root.title("Step 7: list and slider")
root.geometry("320x240")

box = tk.Listbox(root, height=4)
for fruit in ("Apple", "Banana", "Cherry", "Mango"):
    box.insert("end", fruit)
box.pack(pady=8)
info = tk.Label(root, text="Pick a fruit")
info.pack()

def picked(event):
    if box.curselection():                   # empty when nothing is selected
        info.config(text=f"You picked {box.get(box.curselection()[0])}")

box.bind("<<ListboxSelect>>", picked)        # run picked when the selection changes

slider = tk.Scale(root, from_=0, to=100, orient="horizontal", length=200)
slider.pack()
root.mainloop()

# ===== 8. A canvas: drawing and the mouse =====
root = tk.Tk()
root.title("Step 8: a canvas")

canvas = tk.Canvas(root, width=320, height=200, bg="white")
canvas.pack()
canvas.create_rectangle(20, 20, 120, 80, fill="#FFCC80", outline="")
canvas.create_oval(160, 20, 260, 80, fill="#90CAF9", outline="")
canvas.create_text(160, 110, text="Click anywhere", font=("Arial", 12))

def dot(event):                              # event.x and event.y are where you clicked
    canvas.create_oval(event.x - 5, event.y - 5, event.x + 5, event.y + 5, fill="#EF9A9A", outline="")

canvas.bind("<Button-1>", dot)               # left mouse button
root.mainloop()

# ===== 9. A menu, a message box and a clock =====
import time

root = tk.Tk()
root.title("Step 9: menu and clock")
root.geometry("320x160")

clock = tk.Label(root, font=("Arial", 28))
clock.pack(expand=True)

def tick():
    clock.config(text=time.strftime("%H:%M:%S"))
    root.after(1000, tick)                   # call tick again in 1000 ms; never use time.sleep in a window

def about():
    messagebox.showinfo("About", "A tiny Tkinter demo")

menubar = tk.Menu(root)
file_menu = tk.Menu(menubar, tearoff=0)
file_menu.add_command(label="About", command=about)
file_menu.add_separator()
file_menu.add_command(label="Quit", command=root.destroy)
menubar.add_cascade(label="File", menu=file_menu)
root.config(menu=menubar)

tick()
root.mainloop()
