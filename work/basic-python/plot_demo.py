# ===== Imports =====
import os

import matplotlib
matplotlib.use("Agg")                  # draw into files, no window needed (works over SSH too)
import matplotlib.pyplot as plt
import numpy as np

os.makedirs("output", exist_ok=True)

# ===== Example 1: training curves, several lines with a legend =====
epochs = np.arange(1, 21)
rng = np.random.default_rng(1)
train_loss = 1.2 * np.exp(-0.25 * epochs) + rng.normal(0, 0.01, 20)                  # keeps falling
val_loss = 1.2 * np.exp(-0.25 * epochs) + 0.0025 * (epochs - 8) ** 2 * (epochs > 8) + rng.normal(0, 0.01, 20)

best = int(val_loss.argmin()) + 1                       # the epoch with the lowest validation loss

plt.figure(figsize=(7, 4))
plt.plot(epochs, train_loss, color="tab:blue", marker="o", markersize=3, label="training")
plt.plot(epochs, val_loss, color="tab:orange", marker="o", markersize=3, label="validation")
plt.axvline(best, color="gray", linestyle="--", label=f"best epoch ({best})")
plt.title("Loss while training")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.grid(True, alpha=0.3)
plt.legend()
plt.tight_layout()
plt.savefig(os.path.join("output", "loss_curves.png"), dpi=120)
plt.close()
print("best epoch:", best, "| validation loss there:", round(float(val_loss[best - 1]), 3))
print("validation is worse than the best by the end:", val_loss[-1] > val_loss[best - 1])

# ===== Example 2: a bar chart and a scatter plot side by side =====
models = ["linear", "tree", "forest", "mlp"]
accuracy = [0.78, 0.84, 0.91, 0.89]

pts_a = rng.normal([2, 2], 0.7, size=(60, 2))            # class 0
pts_b = rng.normal([4, 3.5], 0.7, size=(60, 2))          # class 1

fig, (left, right) = plt.subplots(1, 2, figsize=(9, 4))
bars = left.bar(models, accuracy, color=["#bbbbbb", "#bbbbbb", "tab:green", "#bbbbbb"])
left.bar_label(bars, fmt="%.2f")                         # write the value on top of every bar
left.set_ylim(0.5, 1.0)
left.set_title("Accuracy by model")
left.set_ylabel("Accuracy")

right.scatter(pts_a[:, 0], pts_a[:, 1], s=14, label="class 0")
right.scatter(pts_b[:, 0], pts_b[:, 1], s=14, label="class 1")
right.set_title("Two classes")
right.set_xlabel("feature 1")
right.set_ylabel("feature 2")
right.legend()
plt.tight_layout()
plt.savefig(os.path.join("output", "bars_and_scatter.png"), dpi=120)
plt.close()
print("best model:", models[int(np.argmax(accuracy))], "with", max(accuracy))

# ===== Example 3: a histogram and a confusion matrix =====
scores = np.concatenate([rng.normal(0.3, 0.12, 200), rng.normal(0.7, 0.12, 200)])
matrix = np.array([[46, 4, 0],
                   [5, 41, 4],
                   [1, 3, 46]])
names = ["cat", "dog", "bird"]

fig, (left, right) = plt.subplots(1, 2, figsize=(9, 4))
counts, edges, _ = left.hist(scores, bins=20, color="tab:purple", alpha=0.8)
left.set_title("How sure the model is")
left.set_xlabel("score")
left.set_ylabel("how many")

image = right.imshow(matrix, cmap="Blues")               # an array drawn as colours
right.set_xticks(range(3), names)
right.set_yticks(range(3), names)
right.set_xlabel("predicted")
right.set_ylabel("true")
right.set_title("Confusion matrix")
for i in range(3):
    for j in range(3):
        right.text(j, i, matrix[i, j], ha="center", va="center",
                   color="white" if matrix[i, j] > 25 else "black")    # readable on dark cells
fig.colorbar(image, ax=right, fraction=0.046)
plt.tight_layout()
plt.savefig(os.path.join("output", "histogram_and_matrix.png"), dpi=120)
plt.close()

print("tallest bin holds", int(counts.max()), "of", len(scores), "scores")
print("accuracy from the matrix:", round(float(np.trace(matrix) / matrix.sum()), 3))
print("files:", sorted(os.listdir("output")))
