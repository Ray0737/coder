---
title: Generative models: autoencoders, VAE, GAN and diffusion
summary: Four different ways to teach a network to make something new.
---

> [!aha] A classifier answers "what is this?". A generative model answers "give me a new one of these". That single difference in goal is why this family of models looks so different from everything else in this course.

## Autoencoders: compress, then reconstruct

An **autoencoder** has two halves: an encoder that squeezes the input down to a small set of numbers (the **latent space**), and a decoder that tries to rebuild the original input from just those numbers. Training pushes the rebuilt output to match the original as closely as possible.

```widget
latentexplorer
```

Because the network is forced through a narrow bottleneck, it can't just memorise pixels, it has to learn which handful of numbers actually matter. Similar inputs end up with similar latent numbers, which is why they cluster together like this.

## VAE: a latent space you can sample from

A plain autoencoder's latent space can have gaps and dead zones: pick a random point and the decoder might produce nonsense. A **Variational Autoencoder (VAE)** instead encodes each input as a small *range* of plausible latent values (a distribution, not one exact point), which packs the latent space more smoothly. That means you can pick a random point almost anywhere and still get something reasonable out, which is what makes a VAE good at generating brand-new examples rather than just reconstructing old ones.

## GAN: two networks competing

> [!compare] Think of it like a forger and a detective improving by competing. A **generator** tries to produce fakes realistic enough to fool a **discriminator**, and the discriminator tries to tell real from fake. Each one getting better forces the other to improve too, and over many rounds the generator's fakes become hard to tell from the real thing.

```widget
ganflow
```

Then watch a real one train. Drag the training step, or press Play: at step 0 the generator makes noise, and over a few thousand iterations the digits take shape while the two losses push against each other.

```widget
ganreal
```

Step through the training rounds: the generator's "looks real" score climbs into the high 80s while the discriminator's confidence falls from near-certain down into the high 50s, close to a coin flip. Neither number alone tells you who is "winning"; what matters is that the gap between them keeps closing, which is exactly what "the generator's fakes are getting harder to catch" looks like as two numbers.

## Diffusion: starting from noise

A **diffusion model** learns to reverse a very simple process: take a real image and add a little random noise, over and over, until it is pure static. Training teaches the network to undo **one small noise step** at a time. To generate something new, start from pure random noise and repeatedly ask the model to denoise it a little, and a recognisable image gradually emerges.

```widget
diffusionreal
```

Scrub the slider from 0 to 20 and watch structure appear out of what started as static. Each step here is a tiny nudge toward the target, exactly like a real diffusion model's reverse process, just sped up and simplified to one shape instead of a photo. Pick a different target shape and the same noise still finds its way to it, which is the point: a trained diffusion model can be pointed at many different outputs, the reverse process itself doesn't change.

### Putting it together: Stable Diffusion

Modern image generators combine two ideas from this chapter: a VAE (compress to a small latent space) and diffusion (denoise inside it).

```widget
sdpipe
```

## Try it

1. In the diffusion widget, press Play and watch it run start to finish. At roughly what step does the shape become recognisable, versus still looking mostly like noise? Try a second target shape and compare.
2. Why would a plain autoencoder's latent space have "dead zones" that a VAE's does not?
3. In the GAN widget, step through all 20 rounds. The discriminator's confidence ends up barely above 50%, a coin flip, while the generator's score ends up near 90. What does that gap closing actually mean about how good the fakes have gotten?
4. In the GAN description, what would happen if the discriminator became perfect (100% accurate) far faster than the generator improved? Would the generator still have anything useful to learn from?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Autoencoder | Summarising a book, then rewriting it from the summary | Compresses to a small latent space, then reconstructs the original |
| Latent space | A map where similar things sit near each other | The small set of numbers an autoencoder/VAE compresses an input into |
| VAE | A smoother, gap-free version of that map | Encodes a range of values instead of one point, so sampling works well |
| GAN | A forger and a detective improving by competing | A generator and a discriminator trained against each other |
| Diffusion | Slowly bringing a photo into focus from static | Learns to reverse noise, one small denoising step at a time |
