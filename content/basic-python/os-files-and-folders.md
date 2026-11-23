---
title: os: files and folders
summary: Let Python move around folders, build file paths safely, and list the files of a dataset.
---

> [!aha] An AI project is mostly files: thousands of pictures in folders, a CSV of results, a saved model. The `os` module lets Python do what you do in File Explorer: look around, open folders, make new ones and find files.

## Where am I?

When a script runs, it has a **current working directory**: the folder it treats as "here". Every relative path starts from it. `.` means "this folder" and `..` means "the folder above". A path like `data/cat.png` is **relative**, because it depends on where you are, and a path like `C:\Users\me\data\cat.png` is **absolute**, because it works from anywhere.

```python
import os

print(os.getcwd())          # the folder the script is running from
print(os.listdir("."))      # the names inside it, as a list of text
```

> [!warn] The most common beginner error is `FileNotFoundError: [Errno 2] No such file or directory`. The file is usually fine. The script is running from a **different folder** than you think. Print `os.getcwd()` and look.

## Building paths: os.path

Never glue paths together with `+` and a slash. Windows uses `\`, Linux and the Raspberry Pi use `/`, and `os.path.join` picks the right one for the machine. `os.path.join` glues the parts together with the right separator for your machine, so the same code works on Windows and on the Pi.

```python
import os

path = os.path.join("data", "images", "cat01.png")
print(path)                       # data/images/cat01.png  (data\images\cat01.png on Windows)
```

## Taking a path apart

The other `os.path` tools take a path apart or ask questions about it. Type a path and see.

```widget
pathviz
```

## The os.path questions

These are the calls the diagram uses, and each one answers a single question about a path.

| Call | Answers |
|---|---|
| `os.path.exists(p)` | is there anything at this path? |
| `os.path.isfile(p)` / `isdir(p)` | is it a file / a folder? |
| `os.path.basename(p)` | the last part, the file name |
| `os.path.dirname(p)` | everything before it, the folder |
| `os.path.splitext(p)` | the path and the extension, split in two |
| `os.path.getsize(p)` | the size in bytes |

> [!compare] Think of it like a postal address. The **absolute** path is the full address with country and street. A **relative** path is "two doors down from here", which only works if you are standing in the right place. `join` writes the address with the correct separators for the country.

## Making, renaming and deleting

These calls make, rename and delete real things on disk, so run them with care. `makedirs` makes the whole chain of folders, and `exist_ok=True` stops it complaining if they are already there. `rename` changes a name (and can move a file), `remove` deletes one file, and `rmdir` deletes a folder only if it is empty.

```python
import os

os.makedirs("results/plots", exist_ok=True)   # makes both folders, no error if they exist
os.rename("old.txt", "new.txt")               # also moves a file
os.remove("temp.txt")                         # deletes a file
os.rmdir("empty_folder")                      # deletes an EMPTY folder
```

> [!warn] `os.remove` is **permanent**. There is no Recycle Bin and no undo. Print the path first and check it is the one you mean before you delete anything, especially inside a loop.

> [!warn] **Danger: never point a delete at a system folder.** On Windows the folder `C:\Windows\System32` holds the files Windows needs to start, and on Linux and the Pi the same goes for `/`, `/bin`, `/usr` and `/etc`. Deleting inside them, or running a delete or `shutil.rmtree` on a wrong or empty path, can leave the computer unable to boot and force a full reinstall, with no way to undo it. A path built from `input()` or from a variable that turned out empty can end up pointing there. Never run a delete you copied from the internet without reading it, test with `print()` first, and only ever delete inside a folder your own program created.

## Copying and deleting a folder

To copy a file, the `os` module has no call, so use `shutil`. To delete a folder with files inside, use `shutil.rmtree`, which is just as permanent as `os.remove`.

```python
import shutil
shutil.copy("a.txt", "b.txt")      # copy a file
# shutil.rmtree("folder")         # delete a folder and everything inside it
```

## Looking through a dataset folder

Image datasets are usually one folder per class, like this.

```
dataset/
    cats/   cat01.jpg  cat02.jpg ...
    dogs/   dog01.jpg  dog02.jpg ...
```

## Loop over the folders and files

Loop over the folders, then over the files inside each, and keep only the pictures. The folder name becomes the **label** and the files become the **examples**, which is how many training programs read data. For each name in `dataset`, the code builds the full path, skips anything that is not a folder, and makes a list of the files inside whose names end in `.jpg` or `.png` (after `lower()`, so `.JPG` counts too). It then prints each class name with how many pictures it has.

```python
import os

root = "dataset"
for label in os.listdir(root):                       # "cats", "dogs"
    folder = os.path.join(root, label)
    if not os.path.isdir(folder):
        continue                                     # skip stray files
    files = [f for f in os.listdir(folder) if f.lower().endswith((".jpg", ".png"))]
    print(label, len(files))
```

## os.walk: every folder at any depth

To visit every folder at any depth in one go, use `os.walk`.

```python
for folder, subfolders, files in os.walk("dataset"):
    print(folder, len(files))
```

> [!tip] `os.listdir` gives names in no promised order. Wrap it in `sorted(...)` when the order matters, such as frames of a video.

## Environment variables: secrets stay out of code

An **environment variable** is a setting that lives in the computer, outside your script. It is the right place for passwords and API keys, so they never end up in a file you share. `os.environ.get("API_KEY")` reads the setting and gives `None` if it is not set, so the `if` can print a helpful message instead of crashing.

```python
import os

key = os.environ.get("API_KEY")        # None if it is not set
if key is None:
    print("Set API_KEY first")
```

> [!warn] Never type a real key or password into your code and then share or upload the file. Anyone who sees the file has the key. Read it from the environment instead.

## The modern alternative: pathlib

Python also has `pathlib`, which treats a path as an object and uses `/` to join. Many new programs use it, so you will meet it. `Path("data") / "images" / "cat01.png"` joins the parts with `/`. The path object then has handy parts, such as `.name` for the file name, `.suffix` for the extension and `.exists()` to check it is there.

```python
from pathlib import Path

p = Path("data") / "images" / "cat01.png"
print(p.name)          # cat01.png
print(p.suffix)        # .png
print(p.exists())
```

## Try it

1. Print the current folder and the names inside it.
2. Build the path to `images/photo.jpg` with `os.path.join`, then print its extension.
3. Make a folder `output/logs` with one call. Run it twice. Why does it not crash the second time?
4. Count how many `.txt` files are in a folder you choose.
5. Why is `os.path.join("data", "x.png")` better than `"data/" + "x.png"`?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `os.getcwd()` | "you are here" on a map | the folder the script runs from |
| `os.listdir(p)` | looking in a drawer | names inside a folder |
| `os.path.join` | writing the address correctly | builds a path for this machine |
| `os.path.exists` / `isfile` / `isdir` | knocking before you enter | checks what is there |
| `os.makedirs(..., exist_ok=True)` | building shelves | makes folders safely |
| `os.remove` | a shredder | deletes a file for good |
| `os.environ` | a safe behind the counter | settings and secrets outside the code |
