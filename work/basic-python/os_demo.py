# ===== Setup: a small fake dataset to work on =====
import os
import shutil

# one folder per class, like a real image dataset: demo_data/cats and demo_data/dogs
for label, names in {"cats": ["cat01.jpg", "cat02.JPG", "cat03.png", "notes.txt"],
                     "dogs": ["dog01.jpg", "dog02.png", "dog03.jpeg"]}.items():
    os.makedirs(os.path.join("demo_data", label), exist_ok=True)      # no error if it exists
    for name in names:
        with open(os.path.join("demo_data", label, name), "w") as f:
            f.write("pretend this is a picture " * 20)                # some bytes, so the files have a size
print("made:", sorted(os.listdir("demo_data")))

# ===== Example 1: look around, and ask questions about paths =====
print("the working folder is an absolute path:", os.path.isabs(os.getcwd()))
print("'.' means here:", os.path.abspath(".") == os.getcwd())

root = "demo_data"
for label in sorted(os.listdir(root)):                    # listdir has no promised order, so sort it
    folder = os.path.join(root, label)
    kind = "folder" if os.path.isdir(folder) else "file"
    print(f"{label:6} is a {kind} with {len(os.listdir(folder))} items")

path = os.path.join(root, "cats", "cat02.JPG")
print("exists:", os.path.exists(path), "| is a file:", os.path.isfile(path))
print("basename:", os.path.basename(path))                # the file name
print("dirname :", os.path.dirname(path))                 # the folder part
print("split   :", os.path.splitext(path))                # the path and the extension
print("size    :", os.path.getsize(path), "bytes")

# ===== Example 2: count the pictures of every class =====
PICTURE_ENDINGS = (".jpg", ".jpeg", ".png")
counts = {}
for label in sorted(os.listdir(root)):
    folder = os.path.join(root, label)
    if not os.path.isdir(folder):
        continue                                          # skip stray files in the dataset root
    pictures = [f for f in sorted(os.listdir(folder)) if f.lower().endswith(PICTURE_ENDINGS)]
    counts[label] = len(pictures)

total = sum(counts.values())
print("label  pictures  share")
for label, n in counts.items():
    print(f"{label:6} {n:8}  {n / total:.0%}")
print("total ", total)

# the same total in one go, by visiting every folder at any depth
walked = 0
for folder, subfolders, files in os.walk(root):
    walked += sum(f.lower().endswith(PICTURE_ENDINGS) for f in files)
print("os.walk agrees:", walked == total)

# ===== Example 3: rename, copy and clean up safely =====
os.makedirs(os.path.join("demo_data", "train"), exist_ok=True)

for label in counts:
    folder = os.path.join(root, label)
    number = 1
    for old in sorted(os.listdir(folder)):
        if not old.lower().endswith(PICTURE_ENDINGS):
            continue                                      # leave notes.txt alone
        ext = os.path.splitext(old)[1].lower()            # keep the extension, in lower case
        new = f"{label[:-1]}_{number:03d}{ext}"           # cat_001.jpg, cat_002.jpg ...
        os.rename(os.path.join(folder, old), os.path.join(folder, new))
        shutil.copy(os.path.join(folder, new), os.path.join("demo_data", "train", new))
        number += 1

print("train folder:", sorted(os.listdir(os.path.join("demo_data", "train"))))

# delete only inside the folder this script made: check first, then remove
target = "demo_data"
if os.path.isdir(target) and os.path.basename(os.path.abspath(target)) == "demo_data":
    shutil.rmtree(target)                                 # permanent, so the check above matters
print("cleaned up:", not os.path.exists(target))
