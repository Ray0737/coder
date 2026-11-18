# Coder: plan

A learning site laid out like VS Code. One place for everything learned in the major classes, plus a deep AI track like EASE AI (ease-ai.academy), all in one editor shell.

Static site. No build step, no backend. Progress and personal notes live in the browser (`localStorage`).

---

## 1. Scope (content)

Each **folder** in Main is one major class, grouped by year like the EAI curriculum. Each **file** is one chapter page. Chapters are in the order they are best learned, built from the class reports. Math and Physics are out for now (Direction phase 2).


### M.4 Foundations
| Folder | Chapters, in learning order |
|---|---|
| Basic Python | **Core Python:** Printing and getting input · Lists · Conditionals · Loops · Functions · Tuples and dictionaries · Object-oriented programming · Tkinter GUI · Capstone: Tkinter study planner ; **Prep for AI Development:** os: files and folders · sys: arguments and the interpreter · NumPy: arrays · Matplotlib: plots · Pandas: tables |
| Circuits, Arduino & GPIO | **Circuit basics:** Voltage, current and resistance · Series, parallel and mixed circuits · Circuit diagrams and measuring ; **Get to know the hardware:** The Arduino board · Pins deep dive: digital, PWM and I2C · Breadboard basics ; **Software:** Arduino IDE and the sketch ; **Wire it up:** Resistors and the voltage divider · LED: blink, and active-high vs active-low · Button: digital input, pull-up and pull-down · LCD: wiring I2C · Ultrasonic sensor (HC-SR04) · Servo motor with PWM |
| Physics in Robotics | **Physics principles:** Linear motion · Circular motion · Differential drive: distance and angle to motor speed ; **Robot setup:** Hardware: ESP32 and motors ; **Code setup:** Project setup · Motor protocol: Dynamixel 2.0 ; **CAD:** Chassis design in Onshape ; **Final mission:** The final mission |
| LINE Chatbot | **Chatbot basics:** What a chatbot is and how it is built · Rule-based NLP: matching what people say ; **Dialogflow:** Dialogflow intents ; **LINE:** LINE Official Account and Messaging API ; **Backend:** Webhook and database: Apps Script and Google Sheets ; **Replies and wrap-up:** Rich replies: Flex Messages · End to end: check stock |

### M.5 Applied AI
| Folder | Chapters, in learning order |
|---|---|
| Raspberry Pi Vision | Equipment · Getting the Pi running · Direct HDMI connection · SSH from the VS Code terminal · Editing on the Pi: vim and nano · Terminal command cheatsheet · Picking the right Python interpreter · GPIO basics: LED and button · Servo control with PWM · Hand tracking with MediaPipe · YOLOv8 object detection · Running lightweight · Problems we faced |
| Computer Vision | Reading and displaying · Mouse events · Crop, flip, rotate and resize · Color spaces · Thresholding and edge detection · Contours · Bitwise operations and masking · Face detection · Face recognition · Feature matching (ORB) · Trained object detection (YOLO) · Beyond the repo: hand tracking and servo |
| AI Development | AI vs machine learning vs deep learning · Neural networks: weights, bias and layers · Activation functions · How training works · Epoch, batch size and iterations · Data cleaning and the train/test split · Overfitting and underfitting · Model evaluation: TP, FP, TN, FN · Accuracy, precision, recall and F1 · Architectures: MLP, CNN, RNN, Transformer and LLM · Not everything is a neural network: decision trees |
| Mecanum Drive Robot | Hardware · Wiring (BCM pin numbers) · Software setup and running · Keyboard controls · Calibrating the drive · Code layout · Dead-reckoning guidance · Ball detection with YOLO · Viewing the camera without a monitor · Autonomous match logic |
| AI Research | Coming soon |

### M.6 Capstone
| Folder | Chapters, in learning order |
|---|---|
| Research | Coming soon |
| Final Project | Coming soon |

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

## 2b. Chapter content (one file per chapter)

```
content/
  README.md            how to write a chapter
  _template.md         copy this to start one
  <class-slug>/<chapter-slug>.md
chapter.html + chapter.js   one page that draws any chapter: chapter.html#<class-slug>/<chapter-slug>
```

- A chapter is a plain Markdown file with a small header (`title`, `summary`). Nothing is stacked in a shared file, so editing one chapter touches one file.
- The class and chapter names live in `notes` in `shell.js`. The sidebar, roadmap and search read from there. A chapter with no file shows "not written yet".
- `chapter.js` has a small Markdown reader (headings, lists, code blocks with Python colours, note boxes, images, links). Chapters are read with `fetch`, so the site has to be served (Live Server locally, any host online).
- Chapter layout follows the width of the main panel: wide (about 1100px or more) splits lesson and note into two equal halves, notebook width (about 820 to 1100px) gives the lesson 3 parts to the note's 2, and anything narrower (iPad and phones) shows the lesson alone with the note sliding over from the right when you press Note. The Note button also hides the panel on wide screens, and the choice is remembered.
- The note panel has bold, italic, inline code, code block, list, Clip (adds the text you selected in the lesson), Copy and a Preview switch. It saves on this device as you type, under `coder:notes:<class>/<chapter>`.
- Done to start: Basic Python / Printing and getting input.
- Later, if needed: quiz blocks, a "run this code" box, per-chapter images in `content/<class>/img/`.

---

## 3. Shell (UI)

| Part | Content |
|---|---|
| Title bar (top) | Logo · text menu (Home, Notes, Exercise, Roadmap, Tools, About, Changelog) · back and forward · **command search** in the middle (finds chapters and pages, `Ctrl+P` / `Ctrl+K` / `Ctrl+Shift+F`) · sidebar toggle |
| Activity bar (left icons) | Home (sidebar lists the sections of the current page) · Main (the notes tree) · Notes, Exercise, Roadmap, Tools (go to page) · bottom: major set (About the major, Projects, Materials) · divider · Settings (opens in the main panel as a tab over the page: theme, language EN / TH, sizing, other; view-only first), About Coder |
| Sidebar | The Main tree (class folders by year, section labels, chapters). On the About page it shows About's own outline instead, and the "Main" card there switches it to the tree. Search lives in the title bar |
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
4. **Notes page** (done): `notes.html` opens on All notes, a library of every note written in any chapter, grouped by class, drawn as formatted Markdown, with search and a Copy button on each. Then Progress (done count, streak, notes written, last opened, a bar per class) and Back up (export and import one file). Notes are written in the note panel beside each chapter and saved as `coder:notes:<class>/<chapter>`. `md.js` is the Markdown reader shared by the chapter page and this page.
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
