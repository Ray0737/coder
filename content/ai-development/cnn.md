---
title: CNN
summary: Convolutional neural network: teaching a network to see, one small sliding window at a time.
---

> [!aha] A photo has thousands of pixels, but almost everything useful in it is a small local pattern repeated all over the image: an edge, a corner, a curve. A CNN learns a handful of tiny pattern-detectors and slides each one across the whole picture instead of inventing a separate rule for every pixel.

## A CNN, as an assembly line

| Stage | Asks | Finds |
|---|---|---|
| 1: Conv + Pool | "What basic shapes do I see?" | Edges, corners |
| 2: Conv + Pool | "What are these shapes part of?" | Eyes, wheels |
| 3: Conv + Pool | "What is the overall object?" | Cat, car |
| 4: Flatten + Dense | "Which category?" | Output probability |

Each stage hands a more abstract answer to the next one. Edges become shapes, shapes become parts, parts become a whole object, and the last stage turns that into a probability for every class. Each stage also sees a larger patch of the image than the one before it.

### Watch a real one learn

Below is a tiny CNN (4 filters, nothing else) that really trained on 8×8 handwritten digits. Drag the epoch from 0 to 30 and watch the filters turn from noise into stroke detectors, the feature maps start to light up on the right parts of the digit, and the loss fall while accuracy climbs.

```widget
cnnpipeline
```

## Convolution: a small window, slid everywhere

A **kernel** (or filter) is a tiny grid of learnable numbers, often 3×3. At every position, it multiplies its numbers against the pixels underneath it and adds up the result into one number. Slide it one step over, repeat. The grid of all those sums is a **feature map**: a picture of "how strongly did this one pattern show up, everywhere".

| Term | What it means |
|---|---|
| Kernel | A small grid of learnable weights (3×3, 5×5…). Detects one pattern wherever it appears. |
| Stride | How far the kernel moves each step. Stride 1 checks every position, stride 2 skips every other. |
| Padding | Zeros added around the edge. "Same" padding keeps the output the same size as the input. |

> [!compare] Think of it like running a magnifying glass over a photo. Each kind of magnifying glass is tuned to spot one thing: vertical lines, horizontal lines, a blur. The network never writes these by hand, it **learns** which small patterns turn out to be useful.

## Try the convolution yourself

Pick a kernel preset, then press Play to slide it across a small 9×9 input, one position at a time. The highlighted square is the current receptive field, the number it produces lands in the matching spot in the output grid on the right.

```widget
convanim
```

The input here is deliberately simple: dark on the left, light on the right, a vertical edge straight down the middle. Watch what each preset does to that edge, and what stride and padding change about the output size.

## Pooling: shrinking on purpose

After a convolution, **pooling** (usually "max pooling") looks at small 2×2 patches of the feature map and keeps only the biggest number in each. This shrinks the map and makes the result a little less fussy about the pattern being in the *exact* same pixel: a cat's eye one pixel to the left is still "an eye was detected here".

Try it on a small map: the window hops two cells at a time and keeps one number per patch.

```widget
maxpoolanim
```

## Feature maps stack, and features get more abstract

A real CNN runs many kernels per layer, so one layer's input of 1 image becomes many feature maps, which the next convolution treats as the "picture" it slides over. That is why depth matters: layer 1 sees raw pixels, layer 3 is effectively looking at a map of "shapes", not pixels, because that is what the layers before it handed over.

## ResNet, transfer learning and data augmentation

| Tool | Real-life picture | What it does |
|---|---|---|
| ResNet (skip connections) | A highway bypass next to the local road | Lets a signal skip a block of layers entirely, so very deep networks can still learn, instead of the signal fading out across 50+ layers |
| Transfer learning | Hiring someone who already knows how to read, then teaching them your subject | Start from a network already trained on millions of images, and only retrain the last layer or two on your smaller dataset |
| Data augmentation | Practicing the same move from different angles | Randomly flips, rotates, crops or recolors training images, so the network can't just memorise exact pixels |

## Try it

1. In the convolution widget, switch between "Vertical edge" and "Horizontal edge" on the same input. Why does one preset light up strongly and the other barely react, given the input is a vertical edge?
2. Set padding to 1 and compare the output size against padding 0, same stride. Which one keeps the output the same size as the input?
3. Set stride to 2. Why does the output shrink faster than with stride 1, even with the same kernel?
4. Why would transfer learning be a bad idea if your new images look nothing like photos (say, medical scans), compared to when they look like ordinary photos?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Kernel | A small magnifying glass tuned to one pattern | Learnable 3×3 (or larger) weights that scan the whole image |
| Stride | How far the magnifying glass jumps each time | Stride 1 checks every position, stride 2 skips every other |
| Padding | A border of zeros around the edge | "Same" padding keeps the output the same size as the input |
| Feature map | A map of "where did this pattern show up" | The output of one kernel slid across the whole input |
| Pooling | Keeping only the loudest voice in each small group | Shrinks the map, tolerates small shifts in position |
| ResNet | A highway bypass | Skip connections that let very deep networks keep learning |
| Transfer learning | Hiring someone who can already read | Reuse a pretrained network, retrain only the last layers |
| Data augmentation | Practicing a move from different angles | Random flips/rotations/crops so the network can't just memorise pixels |
