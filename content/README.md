# How chapters are stored

One chapter = one Markdown file. Nothing is stacked in a shared file.

```
content/
  <class-slug>/
    <chapter-slug>.md
```

The slugs come from the names in `notes` in `shell.js`. The slug is the name in lowercase, with each run of other characters turned into one `-`.

| Name in `shell.js` | File |
|---|---|
| Basic Python / Printing and getting input | `content/basic-python/printing-and-getting-input.md` |
| Circuits, Arduino & GPIO / Breadboard basics | `content/circuits-arduino-gpio/breadboard-basics.md` |

A chapter with no file shows a "not written yet" page, so you can add them one at a time.

## Adding or editing a chapter

1. Make sure the chapter name is in `notes` in `shell.js` (the sidebar, roadmap and search read from there).
2. Copy `content/_template.md` to `content/<class-slug>/<chapter-slug>.md`.
3. Edit the file. Save. Reload the page. No build step.

To rename a chapter, change the name in `shell.js` and rename the file to match.

## Make it interesting

Every chapter should feel like a story, not a manual. For each new idea:

1. **Compare it to something people can picture.** A variable is a labelled lunchbox. `input()` is a cashier waiting for an answer. Say it in the first sentence under the heading. Keep the coloured `[!compare]` box for the one comparison that matters most.
2. **Name the "aha".** One sentence that makes the idea click, in an `[!aha]` box. Put the best one at the top of the chapter.
3. **Show it, then let them poke it.** A short code block first. Use a `widget` where typing something and seeing the result teaches faster than reading.
4. **Line the picture up with the code.** A two-column table of "in real life" against "in Python" makes the comparison concrete.
5. **End with a recap table** that pairs each tool with its real-life picture, and a few small "Try it" tasks.
6. **Go easy on boxes.** One or two coloured boxes, a table or two and a widget or two per chapter is plenty. Let most ideas sit in plain paragraphs with space around them, and skip a "What you will learn" list.

The demo to copy from is `basic-python/printing-and-getting-input.md`.

## File format

The top of the file is a short header between two `---` lines. Everything under it is Markdown.

```
---
title: Printing and getting input
summary: One sentence under the title.
---
```

| Write this | You get |
|---|---|
| `## Heading` and `### Smaller heading` | Headings (the page title comes from `title`, so start at `##`) |
| Blank line between paragraphs | Paragraphs |
| `**bold**`, `*italic*`, `` `code` `` | Bold, italic, inline code |
| `- item` or `1. item` | Lists |
| A fenced block with a language (three backticks, then `python`) | A code block. `python` also gets colour |
| `> text` | A plain note box |
| `> [!aha] text` | A yellow "Aha!" box |
| `> [!compare] text` | A blue "Think of it like" box for a real-life comparison |
| `> [!tip] text` | A green "Tip" box |
| `> [!warn] text` | A red "Careful" box |
| `\| a \| b \|` rows with a `\|---\|---\|` line under the first | A table. Good for "in real life / in Python" |
| A fenced block with the language `widget` and a name inside | A live widget (see below) |
| `[text](https://...)` | A link |
| `![alt text](path/to/image.png)` | An image. Put images next to the chapter or in `assets/` |

## Live widgets

A widget is a small playground drawn inside the chapter. Write a fenced block with the language `widget` and put the widget's name on the line inside it. Widgets live in the `widgets` object in `chapter.js`.

| Name | What it does |
|---|---|
| `fstring` | Fill in a name and a score and watch an f-string sentence change |
| `inputtype` | Type into a pretend `input()` and see why the text needs `int()` before you can add to it |

To add one, add a function with the new name to `widgets` in `chapter.js`. It receives the empty box and fills it.

## Viewing locally

The page reads the `.md` files with `fetch`, so open the site through a local server (VS Code Live Server works) and not by double-clicking the file.
