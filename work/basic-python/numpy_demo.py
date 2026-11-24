# ===== Imports =====
import numpy as np

# ===== Example 1: arrays, shapes, axis and broadcasting =====
# sales of 3 shops (columns) over 4 days (rows)
sales = np.array([[12, 30, 21],
                  [15, 28, 25],
                  [ 9, 35, 19],
                  [14, 31, 27]])
print("shape:", sales.shape, "| items:", sales.size, "| type:", sales.dtype)

print("total of everything :", sales.sum())
print("per shop (axis=0)   :", sales.sum(axis=0))       # squash the rows: one total per column
print("per day  (axis=1)   :", sales.sum(axis=1))       # squash the columns: one total per row
print("best shop on average:", sales.mean(axis=0).argmax(), "(index of the biggest mean)")

# broadcasting: a row of 3 numbers is stretched down all 4 rows
centered = sales - sales.mean(axis=0)                    # subtract each shop's own average
print("average of each shop after centering:", centered.mean(axis=0).round(2))

# a mask: pick the days where shop 1 sold more than 30
mask = sales[:, 1] > 30
print("days above 30 in shop 1:", np.where(mask)[0], "->", sales[mask, 1])

# ===== Example 2: a picture is an array =====
# a 6 x 6 grey picture: a dark background with a bright 2 x 2 square and a gradient column
img = np.zeros((6, 6), dtype=np.uint8)
img[2:4, 2:4] = 200                                      # slicing sets a block: rows 2-3, columns 2-3
img[:, 5] = np.linspace(0, 255, 6).astype(np.uint8)      # the last column goes from black to white
print(img)

crop = img[1:5, 1:5]                                     # [y1:y2, x1:x2], exactly the OpenCV way
print("crop shape:", crop.shape)
print("row 2        :", img[2])
print("row 2 flipped:", img[2, ::-1])                    # ::-1 reads backwards: a left-right flip
print("last column flipped:", img[::-1, 5])              # reading the rows backwards: an upside-down flip

# uint8 cannot go past 255: it wraps around
bright_wrong = img + 100                                 # 200 + 100 wraps to 44
bright_right = np.clip(img.astype(int) + 100, 0, 255)    # bigger type first, then clip
print("wrapped :", bright_wrong[2, 2], "| clipped:", bright_right[2, 2])

# a colour picture adds a third axis: height, width, 3 channels
rgb = np.zeros((2, 3, 3), dtype=np.uint8)
rgb[0, 0] = [255, 0, 0]                                  # top-left pixel
rgb[1, 2] = [0, 0, 255]                                  # bottom-right pixel
print("colour shape:", rgb.shape, "| red channel:\n", rgb[:, :, 0])
print("grey version:", (rgb.mean(axis=2)).round(0).astype(int).tolist())

# ===== Example 3: a neuron, a layer and a prediction =====
def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def softmax(z):
    e = np.exp(z - z.max(axis=1, keepdims=True))         # subtract the max so exp() cannot overflow
    return e / e.sum(axis=1, keepdims=True)

# one neuron: the weighted sum of 3 inputs, then an activation
x = np.array([1.0, 2.0, 3.0])
w = np.array([0.5, -1.0, 2.0])
b = 0.5
z = np.dot(x, w) + b                                     # 1*0.5 + 2*-1 + 3*2 + 0.5
print("z =", z, "| sigmoid(z) =", round(float(sigmoid(z)), 4))

# a whole layer for a batch: 4 examples, 3 inputs, 3 output neurons, all in one line
rng = np.random.default_rng(0)
X = rng.normal(size=(4, 3))                              # 4 examples
W = rng.normal(size=(3, 3))                              # 3 inputs -> 3 neurons
B = np.zeros(3)
scores = X @ W + B                                       # matrix multiplication
probs = softmax(scores)                                  # each row now adds up to 1
print("scores shape:", scores.shape)
print("probabilities of example 0:", probs[0].round(3), "| sum:", probs[0].sum().round(3))

names = np.array(["cat", "dog", "bird"])
best = probs.argmax(axis=1)                              # the index of the biggest probability per row
print("predictions:", names[best].tolist())
print("confidence :", probs.max(axis=1).round(2).tolist())
print("confident (> 0.6):", (probs.max(axis=1) > 0.6).sum(), "of", len(X))
