# Coder: plan

A learning site laid out like VS Code. One place for everything learned in the major classes, plus a deep AI track like EASE AI (ease-ai.academy), all in one editor shell.

Static site. No build step, no backend. Progress and personal notes live in the browser (`localStorage`).

---

## 1. Scope (content)

Each **folder** in Main is a subject. Each **file** is one chapter page.

### Major classes (from the EAI curriculum)
| Folder | Chapters |
|---|---|
| Python | Weekly exercises (W01–W11), ATM terminal exam, Tkinter study planner |
| Circuits & Arduino | Ohm's law, Series and parallel, Breadboard basics, PWM, Servo, Ultrasonic, I2C LCD |
| Robotics | ESP32 differential drive, Onshape CAD, Dynamixel protocol |
| LINE Chatbot | Dialogflow intents, Apps Script webhook, Sheets database, Flex Message |
| Raspberry Pi | Hand tracking, Servo control, YOLOv8 detection |
| Computer Vision | Image processing, Face and hand detection, YOLO detection |

### AI track (EASE AI style, math to models)
| Folder | Chapters |
|---|---|
| Math for AI | Linear algebra, Calculus, Gradient descent, Probability |
| Machine Learning | Regression, SVM, Decision tree, K-means, PCA |
| Neural Networks | Perceptron, Backprop, Dropout, BatchNorm, Optimizers |
| CNN | Convolution, Pooling, Feature maps, ResNet |
| RNN / LSTM | Sequences, Gates, Vanishing gradient |
| Transformer | Self-attention, Multi-head, Positional encoding |
| Generative | VAE, GAN, Diffusion, Latent space |
| LLM & RL | Language models, RLHF, Q-learning, Policy |

### General classes (already written in EAI Copy 2 `summary/`)
| Folder | Chapters |
|---|---|
| Math | Sets and logic, Real numbers, Functions, Analytic geometry, Conic sections |
| Physics | Kinematics, Newton's laws, Projectile and circular, Equilibrium, Incline, Energy, Momentum |

---

## 2. Pages

| Page | File | What it is |
|---|---|---|
| Home | `index.html` | The VS Code Welcome tab: start links, recent, walkthroughs (learning half) · Our Major (About the major, Projects, Materials), your data |
| Chapter | `notes/<folder>/<chapter>.html` | One chapter, read top to bottom. Opens as an editor tab |
| Notes | `notes.html` | Your progress and notes: chapters done per folder, streak, last opened, all your own notes in one list |
| Exercise | `exercise.html` | Practice problems per folder (code tasks, circuit questions, find the bug), marked done locally |
| Roadmap | `roadmap.html` | All folders as one path, what to learn first and what each chapter needs (EASE-style graph) |
| Tools | `tools.html` | Recommended tools (editors, boards, libraries, AI tools), each with why and a link |
| About | `about.html` | What the site is, who made it, credits |
| Changelog | a tab on `about.html` (`#changelog`) | Dated list of what was added or changed |
| About the major | `major.html` | What the major is, its classes by level, who it's for |
| Projects | `projects.html` | Class projects showcase (Tkinter planner, ESP32 robot, LINE chatbot, M.5 Mecanum, lane-tracking robot) |
| Materials | `materials.html` | Class files and handouts, code downloads |

Every page uses the same shell (section 3), so moving between pages feels like switching tabs.

---

## 3. Shell (UI)

| Part | Content |
|---|---|
| Title bar (top) | Logo · text menu (Home, Notes, Exercise, Roadmap, Tools, About, Changelog) · back and forward · **command search** in the middle (finds chapters and pages, `Ctrl+P` / `Ctrl+K` / `Ctrl+Shift+F`) · sidebar toggle |
| Activity bar (left icons) | Home (sidebar lists the sections of the current page) · Main (the notes tree) · Notes, Exercise, Roadmap, Tools (go to page) · bottom: major set (About the major, Projects, Materials) · divider · Settings (opens in the main panel as a tab over the page: theme, language EN / TH, sizing, other; view-only first), About Coder |
| Sidebar | Home panel: Welcome, then the same list as About (Overview, What's here, Shortcuts, Your data, Built with, Developer), each opening that About tab; About's own list starts at Overview · Main panel: folders and chapters. Search lives in the title bar |
| Editor | Tabs, breadcrumb, page content |
| Status bar (footer) | Left: brand bubble, branch, problems, notes count, chapters done · Right: language · Major, Projects, Materials · About, Changelog · **Developer** (popup on hover, stays open on click: name, GitHub, email, major GitHub org) · contact bubbles (email, GitHub), © |

Rules:
- Catppuccin Mocha, the same mapping as the Catppuccin VS Code theme.
- LINE Seed font. Small sizes (11–12px base). Bold allowed, no all caps.
- Rounded floating panels with gaps. No left or top border accents; the active item gets a rounded fill.
- Hover changes colour only (brighter or darker). Links may also underline.
- Footer: a **bubble holds an icon only**; **text never sits in a bubble**. Icons everywhere.
- Phone: the sidebar slides over the editor; less important status items hide.

---

## 4. Data (local only)

`localStorage` keys, all prefixed `coder:`. Every read and write goes in try/catch, and the site still works when storage is blocked.

| Key | Value |
|---|---|
| `coder:done` | `["python/tkinter-study-planner", ...]` chapters marked done |
| `coder:notes:<chapter>` | the reader's own note for that chapter (plain text) |
| `coder:recent` | the last 5 chapters opened (drives Home → Recent) |
| `coder:exercise` | `["python/w01-1", ...]` exercises solved |
| `coder:streak` | `{ last: "2026-11-18", days: 3 }` |

Export / import as one JSON file on the Notes page, so data survives a browser wipe or moves to another device.

Chapter list: one `data.js` (folder, chapter, slug, tags), read by every page. Adding a chapter means one line in `data.js` and one new HTML file.

---

## 5. Build order

1. **Shell + Home** (done): title bar, activity bar, sidebar, status bar, Welcome tab.
2. **Shared shell** (done): `shell.js` builds the chrome, search, tooltips and developer card around each page's `<main class="ed">`. A page only supplies its `<main>` and a `<template id="outline">` for its sidebar list. The chapter list still lives in `shell.js`; split it into `data.js` when chapters get real pages.
2b. **About Coder** (done): `about.html`.
3. **Chapter template**: first real chapters (start with Python and Circuits), "Mark done" button, a "My note" box.
4. **Notes page**: per-folder bars, streak, your notes, export and import.
5. **Roadmap page**: the folder path and what each chapter needs first.
6. **Exercise page**: first problem sets (Python, Circuits).
7. **Tools, About, Changelog**.
8. **Major set**: About the major, Projects, Materials.
9. **AI track chapters**, with live diagrams where they help.

Later, maybe: a side-by-side compare page (EASE Arena style).

---

## 6. Open questions

- Keep the General classes (Math, Physics) in, or major plus AI only?
- English only, or Thai/English like EAI?
- Copy the existing Math/Physics summaries over from EAI Copy 2, or rewrite them in the new layout?
- Hosting: Vercel like the EAI site?
