---
title: LLM and RL
summary: Large language models and reinforcement learning: predicting the next word, and learning from reward instead of labels.
---

> [!aha] Underneath everything, a large language model does one simple job on repeat: given the text so far, guess a probability for every possible next word, then pick one. Reinforcement learning answers a completely different question: no labelled "right answer" exists, so an agent instead learns from a reward signal, by trial and error.

## How an LLM reads: tokens, vectors, layers

A language model does not read letters or words. It reads **tokens**: numbered pieces of text. Type anything below.

```widget
tokenizer
```

Each token ID is then turned into a vector. Similar meanings end up as nearby vectors, and directions in that space can carry relationships.

```widget
embedding
```

Put together, here is what happens for every single token the model produces:

1. **Text in:** you send some text, like "The cat sat".
2. **Tokenize:** the text is cut into tokens and each piece becomes a number from a fixed vocabulary.
3. **Embed:** each token number becomes a vector, so similar meanings sit close together.
4. **Transformer × N:** the vectors pass through N Transformer layers (dozens in big models), each one refining what every token means in context.
5. **Output probabilities:** the last layer gives a probability for every token in the vocabulary. One is picked, added to the text, and the whole thing repeats.

Each layer refines the representation. Generating a paragraph means running this loop once per token.

## Language modeling: predicting the next token

```widget
tokenplay
```

Every candidate next word gets a score (a **logit**), and those scores get turned into probabilities by **softmax**, the "one pie to share" function from the Classification chapter: every candidate word gets a slice, and the slices always add up to 100%. The **temperature** slider controls how sharply the model commits to its favourite: low temperature almost always picks the top word, high temperature flattens the odds so less likely words get a real chance. Press "Generate" a few times at different temperatures and watch the kind of sentence that builds up.

## Fine-tuning and RLHF

A **base model** is trained purely to predict the next token over huge amounts of text, which makes it good at continuing text, not necessarily at being a helpful assistant. **Fine-tuning** keeps training it, but on a smaller, curated set of examples of the behaviour you actually want. **RLHF** (Reinforcement Learning from Human Feedback) goes one step further, and it is a large part of what turns a text-continuer into an assistant. GPT becomes ChatGPT in four stages:

```tgrid4
1. Pre-training | The model reads a huge amount of text, trillions of tokens, and learns to predict the next one. It ends up knowledgeable, but it only continues text. Asked a question, it may reply with another question. This is by far the most expensive stage.
2. SFT | Supervised fine-tuning. People write thousands of example answers to example prompts, and the model is trained on them like any labelled data. It learns the shape of a good reply: follow the instruction, answer it, stay polite.
3. Reward model | The model writes several answers to one prompt and people rank them from best to worst. A separate model learns to give each answer a score that agrees with the rankings. It becomes a stand-in for human taste that can be asked millions of times.
4. PPO | Reinforcement learning (proximal policy optimization). The model writes answers, the reward model scores them, and the model is nudged toward higher scores. A penalty keeps it close to the SFT model, so it cannot drift into nonsense.
```

> [!compare] Think of it like a writer (the base model) who already knows grammar and a huge amount of facts, then gets an editor (fine-tuning) teaching them the house style, then ongoing feedback from readers (RLHF) nudging future drafts toward what people actually respond well to.

### How the reward model learns from rankings

People are poor at scoring an answer out of ten, but good at saying which of two answers is better. So the reward model is trained on **pairs**: for each pair, it is pushed to give the preferred answer the higher score. The model's confidence that A beats B grows with the gap between their scores:

```python
p_a_beats_b = 1 / (1 + math.exp(-(score_a - score_b)))
```

With the scores below, 8.4 against 1.2, the gap is 7.2 and the confidence is about 99.9%. With equal scores it would be exactly 50%.

### The catch: a reward model is only a stand-in

The reward model is a model too, so it has blind spots. If the main model chases its score with no limit, it will find replies that score high but are not really good, such as piling on flattery. That is called **reward hacking**. So PPO does not just maximise the score. It pays a price for drifting away from the model it started from, measured by the **KL divergence** (how different the two models' answer odds are):

```python
objective = average_reward - beta * drift_from_base_model   # pushed up
new_odds[reply] = base_odds[reply] * math.exp(reward[reply] / beta)   # then rescale
```

The dial **beta** decides how expensive drifting is. Move it and watch four possible replies to the same angry customer:

```widget
rlhfkl
```

What to look for:

- **Slide it down (Free).** The model stops caring about staying close and goes where the score is highest. The flattery reply D has the best score, so it takes a big share even though it helps nobody. The drift number shoots up.
- **Slide it up (Tight).** Every bar sits on its white tick: the model is still the base model. The drift is almost zero, but so is the improvement.
- **In the middle (Balanced).** Reply A, the genuinely helpful one, gains the most and the curt reply B fades, but the flattery creeps up as well, because the reward model likes it. This is the trade RLHF is trying to make.

> [!aha] RLHF is a tug of war between two forces: the reward model pulling the model toward higher scores, and the KL penalty pulling it back toward where it started. Too little penalty and the model exploits the judge. Too much and nothing changes.

## Reinforcement learning: learning from reward, not labels

An RL agent takes actions in an environment, gets a reward signal, and gradually learns which actions tend to lead to more reward. There is no "correct answer" supplied anywhere, just trial, error, and a score.

```widget
qlearning
```

Press Train and watch the average reward (purple line) climb. At first the agent wanders and sometimes falls into the trap; after enough episodes it settles on a short, direct route. Press Walk to watch it follow the arrows, and switch "Show" to Q-values to shade every cell by its best learned Q-value: the cells closer to the goal glow brighter, because the reward flows backwards through the grid one step at a time.

## Q-learning and policy gradient, in one line each

- **Q-learning** learns a table (or a network) of "how good is this action, from this state", called a **Q-value**, and then always picks whichever action has the highest Q-value. That is exactly what powers the grid-world widget above.
- **Policy gradient** methods skip the Q-value table and directly learn a policy: a rule that outputs a probability for each action, nudged to make the better-scoring actions more likely over time.

## Try it

1. Set the temperature all the way down, then all the way up, in the token widget. Describe the difference in how predictable the bar chart becomes.
2. In the RLHF widget, drag the penalty all the way down to Free. Which reply wins, and is it really the best one? What does that show about a reward model?
3. In the Q-learning widget, press Walk before training, then train fully and press Walk again. What changed about the agent's behaviour, concretely? Switch to Q-values and describe what the shading looks like near the start versus near the goal.
4. Why does RLHF need a separate reward model at all? Why not just have humans score every single response the model produces while training?
5. In the grid world, the reward is -0.1 per step, +10 at the goal and -5 in the trap. Why would that encourage a *shorter* path, not just *any* path that reaches the goal?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Language modeling | Finishing someone else's sentence | Predicts a probability for the next token, given everything so far |
| Temperature | How adventurous a guesser you are | Low = always pick the top guess, high = spread the odds out more |
| Fine-tuning | An editor teaching house style | Keeps training a base model on a smaller, curated dataset |
| RLHF | Reader feedback shaping future drafts | A reward model, trained on human rankings, nudges the model's outputs |
| Q-learning | A table of "how good is this move, from here" | Learns action values, then always takes the best one |
| Policy gradient | Directly learning a habit, not a scorecard | Learns a rule for picking actions, nudged toward higher reward |
