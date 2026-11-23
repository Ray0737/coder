---
title: CNN
summary: Teaching a network to see: tiny pattern detectors slid across the whole image, stacked from edges up to objects.
---

> [!aha] A photo has thousands of pixels, but almost everything useful in it is a small local pattern repeated all over the image: an edge, a corner, a curve. A CNN learns a handful of tiny pattern detectors and slides each one across the whole picture, instead of inventing a separate rule for every pixel.

## Why a plain network struggles with images

A **convolutional neural network (CNN)** is a network built for grids of numbers, mostly images. The MLP from earlier would flatten a photo into one long list and connect every pixel to every neuron, which has two problems: the number of weights explodes, and the network forgets that neighbouring pixels belong together, so a cat in the corner and a cat in the middle look like two unrelated problems. A CNN fixes both by reusing one small set of weights everywhere and only ever looking at a small patch at a time.

| For a 224×224 colour photo | Weights to learn |
|---|---|
| One dense layer of 1,000 neurons | 150,528,000 |
| 64 convolution filters of size 3×3 | 1,792 |

> [!more] Math: where those two numbers come from
> The photo has `224 × 224 × 3 = 150,528` input numbers, and a dense layer joins each one to every neuron:
>
> ```math
> dense:  150,528 inputs × 1,000 neurons = 150,528,000 weights
> conv:   (3 × 3 × 3 weights + 1 bias) × 64 filters = 1,792 weights
> ```
>
> The conv count does not depend on the image size at all, because the same filter is reused at every position. That reuse is called **weight sharing**.

## Convolution: a small window, slid everywhere

A **kernel** (or filter) is a tiny grid of learnable numbers, often 3×3. At every position it multiplies its numbers against the pixels underneath and adds the result into one number, then slides one step and repeats. The grid of all those sums is a **feature map**, a picture of how strongly that one pattern showed up at each place. Pick a kernel and press Play to slide it over a 9×9 input with a vertical edge down the middle, and try stride and padding.

```widget
convanim
```

> [!compare] Think of a magnifying glass run over a photo. Each kind of glass is tuned to spot one thing, like vertical lines or a blur, and the network never writes these by hand: it learns which small patterns turn out to be useful.

> [!more] TLDR: stride, padding and what the kernel really learns
> **Stride** is how far the kernel jumps each step: stride 1 checks every position, stride 2 skips every other and halves the output. **Padding** adds a border of zeros so the kernel can centre on the edge pixels, and "same" padding keeps the output the same size as the input. The four presets here are classic hand-made kernels, but in a real CNN the nine numbers start random and training nudges them, so the network invents its own edge, corner and texture detectors.
>
> A colour image has 3 channels (red, green, blue), so the kernel is really 3×3×3, one 3×3 grid per channel, added into a single number.

> [!more] Math: the output size and one window's sum
> For an input of side `N`, kernel `k`, padding `p` and stride `s`, the output side is:
>
> ```math
> output = (N + 2p − k) / s + 1          N = 9, k = 3, p = 0, s = 1  gives  7
> ```
>
> Each output number is the sum of the products of the kernel with the patch under it, plus a bias `b` that is learned too:
>
> ```math
> out(y, x) = Σ over a, c of  kernel(a, c) · input(y + a, x + c)  +  b
> ```
>
> (Strictly this is called cross-correlation, since the kernel is not flipped, but deep learning libraries call it convolution anyway.)

## Pooling: shrinking on purpose

After a convolution, **pooling** looks at small patches of the feature map and keeps one number from each. The usual choice is **max pooling**: take the biggest number in each 2×2 patch. That halves the map in both directions and makes the network a little less fussy about exactly where a pattern sat, since an eye one pixel to the left still counts as "an eye was detected here". Step through a 6×6 map below.

```widget
maxpoolanim
```

> [!compare] Think of keeping only the loudest voice in each small group. You lose the exact seat each person sat in, but you keep who spoke up.

> [!more] TLDR: why shrink, and what replaced pooling
> Shrinking has three payoffs: less memory and computing for the next layer, a bit of tolerance to small shifts, and a wider view for later layers (the next section shows this). Pooling has no weights to learn. Many modern networks get the same shrinking by giving the convolution itself a stride of 2, and the very end of a network often uses **global average pooling**, which averages each whole feature map down to one number.

## Stacking blocks: from edges up to objects

One conv + pool block spots simple things. A real CNN stacks many blocks, and each block's input is the previous block's feature maps, so layer 1 reads pixels and layer 3 reads a map of shapes. Every pooling halves the map while the **channel** count (feature maps per layer) usually doubles, and each unit sees a wider patch of the original photo than the one before. Add blocks below and watch the map shrink while the field of view grows.

```widget
cnnstack
```

> [!compare] Think of an assembly line. Early stations ask "where are the edges?", the next ask "which edges form an eye or a wheel?", the last ask "which parts make a cat or a car?", and the final answer is a probability for each class.

> [!more] TLDR: receptive field and the flatten-and-dense end
> The patch of the original image that one unit depends on is its **receptive field**. A 3×3 kernel sees 3 pixels, but pooling and stacking make it grow quickly: after five blocks a single unit sees 94 pixels of the width, which is how small local detectors end up recognising whole objects. At the end the last feature maps are **flattened** into one list and passed through a few dense layers (or one softmax layer) that turn the "what was found" into a probability for each class.

> [!more] Math: how the field of view grows
> Track the receptive field `r` and the jump `j` (how many input pixels one step in this layer's map equals), starting at `r = 1`, `j = 1`. A 3×3 conv adds `2j` to `r`, a 2×2 pool adds `j` to `r`, then the pool doubles `j`:
>
> ```math
> block 1:  r = 1 + 2·1 + 1 = 4,   j = 2        block 2:  r = 4 + 2·2 + 2 = 10,   j = 4
> block 3:  r = 10 + 2·4 + 4 = 22, j = 8        block 4:  r = 22 + 16 + 8 = 46,   j = 16
> ```

### Watch a real one learn

Below is a tiny CNN (4 filters, nothing else) that really trained on 8×8 handwritten digits. Drag the epoch from 0 to 30 and watch the filters turn from noise into stroke detectors, the feature maps start to light up on the right parts of the digit, and the loss fall while accuracy climbs.

```widget
cnnpipeline
```

## Going deeper: ResNet and skip connections

Stacking more layers should help, but very deep plain networks got worse, not better: the learning signal flowing backward shrinks a little at every layer until the early ones barely learn. **ResNet** adds a **skip connection** around each small group of layers, so the block outputs its input plus a correction, and the signal always has a clean shortcut to travel on. Raise the layers and shrink the kept fraction to see how fast the plain road fades.

```widget
resdepth
```

> [!compare] Think of a highway bypass beside the local road. The bypass lets traffic skip the whole town, so the message still arrives even if the town streets are jammed.

> [!more] Math: why the shortcut keeps gradients alive
> A residual block outputs `y = F(x) + x`, where `F` is its few conv layers. Going backward, the slope of `y` with respect to `x` is:
>
> ```math
> dy/dx = dF/dx + 1
> ```
>
> The `+ 1` is the shortcut. Even if `dF/dx` is tiny, the signal still passes through at full strength, while a plain stack multiplies many small numbers together and approaches zero. A block can also learn `F = 0` and simply pass its input through, so adding a block can never make the network worse than before.

## Transfer learning and data augmentation

Two habits make CNNs work with modest data. **Transfer learning** starts from a network already trained on millions of photos and retrains only its last layer or two on your small dataset, because the early filters (edges, textures) are useful for nearly any picture. **Data augmentation** randomly flips, crops, rotates and recolours the training images each time they are shown, so the network sees a fresh variation instead of memorising exact pixels.

| Tool | What you change | Use it when |
|---|---|---|
| Transfer learning | Keep the early layers, retrain the last one or two | You have few labelled images |
| Fine-tuning | Retrain all the layers with a small learning rate | You have more images, or they differ from photos |
| Data augmentation | Randomly alter each training image | The network overfits, or the data is small |

> [!compare] Think of hiring someone who already knows how to read, then teaching them your subject. They do not start from the alphabet.

> [!more] TLDR: when transfer learning fails, and what augmentation must not do
> Early layers learn general things, but late layers learn things specific to the original photos. If your images look nothing like ordinary photos (medical scans, satellite maps), fewer of the early layers carry over, so you retrain more of them. For augmentation, only use changes that keep the label true: a flipped cat is still a cat, but a flipped "b" is a "d", and a rotated "6" is a "9".

```cta
flask | See it for yourself | Put a CNN side by side with an MLP and compare size, speed and accuracy on MNIST.
Neural network comparison | @compare#MLP,CNN | MLP next to a CNN
```

## Try it

1. In the convolution diagram, switch between Vertical edge and Horizontal edge on the same input. Why does one light up strongly and the other barely react?
2. Set padding to 1 and compare the output size against padding 0 at the same stride. Which keeps it the same as the input?
3. Set stride to 2. Why does the output shrink faster, even with the same kernel?
4. In the stacking diagram, pick 224×224 and add all five blocks. How much of the image does one last unit see, and how many weights does it cost?
5. In the ResNet diagram, set 50 layers with 80% kept per layer. What is left on the plain road, and what is left on the shortcut?
6. A 6×6 map is pooled with a 2×2 window and stride 2. What is the output size, and why can pooling not be learned?
7. Why would transfer learning work worse on X-ray scans than on photos of dogs?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Kernel | A magnifying glass tuned to one pattern | Learnable 3×3 weights that scan the whole image |
| Stride, padding | How far it jumps, and a border of zeros | Control the output size |
| Feature map | A map of where one pattern showed up | The output of one kernel slid across the input |
| Weight sharing | One stencil reused everywhere | Keeps the weight count tiny and tolerates shifts |
| Pooling | Keeping the loudest voice in each group | Shrinks the map and tolerates small shifts |
| Receptive field | How much of the photo one unit can see | Grows with each block, from edges to objects |
| ResNet | A highway bypass | Skip connections that let very deep networks keep learning |
| Transfer learning | Hiring someone who can already read | Reuse a pretrained network and retrain only the last layers |
| Data augmentation | Practising a move from different angles | Random flips and crops so it cannot memorise pixels |
