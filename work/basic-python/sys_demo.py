# ===== Imports =====
import argparse
import sys

# ===== Example 1: a calculator that reads its job from the command line =====
# real use:  python sys_examples.py add 3 4
# Each example takes the list of words as a parameter, so it can be tried with a made-up list here.
def calculator(argv):
    """argv looks like ['add', '3', '4']. Returns an exit code: 0 is success, anything else is a problem."""
    if len(argv) != 3:
        print("Usage: python calc.py OPERATION NUMBER NUMBER   (add, sub, mul or div)")
        return 1
    operation, a, b = argv
    try:
        a, b = float(a), float(b)                  # every argument arrives as text
    except ValueError:
        print(f"Not a number: {argv[1]!r} or {argv[2]!r}")
        return 2
    if operation == "add":
        result = a + b
    elif operation == "sub":
        result = a - b
    elif operation == "mul":
        result = a * b
    elif operation == "div":
        if b == 0:
            print("Cannot divide by zero")
            return 3
        result = a / b
    else:
        print(f"Unknown operation: {operation}")
        return 4
    print(f"{operation} {a:g} {b:g} = {result:g}")
    return 0

for demo in (["add", "3", "4"], ["mul", "2.5", "4"], ["div", "1", "0"], ["add", "3"], ["pow", "2", "3"], ["add", "x", "1"]):
    code = calculator(demo)
    print(f"  exit code {code}\n")
# the last line of a real script would be:  sys.exit(calculator(sys.argv[1:]))

# ===== Example 2: which Python is running, and where am I? =====
print("python version :", ".".join(str(n) for n in sys.version_info[:3]))
print("platform       :", sys.platform)                    # win32, linux or darwin
print("interpreter    :", sys.executable.replace("\\", "/").split("/")[-1])   # just the file name
in_venv = sys.prefix != sys.base_prefix                     # true inside a virtual environment
print("inside a venv  :", in_venv)
print("import search  :", len(sys.path), "folders, the first one is the script's own folder")

# does a library exist, without crashing if it does not?
for name in ("json", "numpy", "no_such_library"):
    print(f"  {name:16}", "imported already" if name in sys.modules else "not imported yet")

# ===== Example 3: options with names, and messages on stderr =====
# real use:  python train.py data.csv --epochs 20 --lr 0.01
parser = argparse.ArgumentParser(description="Train a model on a CSV file")
parser.add_argument("path")                                   # required
parser.add_argument("--epochs", type=int, default=5)          # optional, becomes an int
parser.add_argument("--lr", type=float, default=0.1)          # optional, becomes a float
parser.add_argument("--verbose", action="store_true")         # a flag: present means True

args = parser.parse_args(["data.csv", "--epochs", "20", "--lr", "0.01", "--verbose"])
print("path   :", args.path)
print("epochs :", args.epochs, type(args.epochs).__name__)
print("lr     :", args.lr, type(args.lr).__name__)
print("verbose:", args.verbose)

args = parser.parse_args(["other.csv"])                       # nothing else given: the defaults are used
print("defaults:", args.epochs, args.lr, args.verbose)

# normal results go to stdout, problems go to stderr, so they can be kept apart
print("training finished")                                    # sys.stdout
print("warning: the learning rate is high", file=sys.stderr)  # sys.stderr
