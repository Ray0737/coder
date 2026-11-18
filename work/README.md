# How work files are stored

Work is the real code for each class: the full programs, tools and scripts.

```
work/
  <class-slug>/
    W01.py
    W02.py
```

The class slug is the same one the chapters use (`basic-python`, `circuits-arduino-gpio` and so on).

## Adding a file

1. Copy the file into `work/<class-slug>/`.
2. Add it to `WORK` in `work.js`, under the chapter it belongs to:

```js
'basic-python/printing-and-getting-input': [
  { file: 'W01.py', title: 'Print', note: 'One sentence about what the file does.' },
],
```

The key is the chapter's address (`<class-slug>/<chapter-slug>`), the same one chapters use. The sidebar on the Work page lists the file under that chapter, and the chapter page it belongs to is linked from the file.

A chapter with no work yet shows dimmed in the Work sidebar.

Like chapters, work files are read with `fetch`, so open the site through a local server (VS Code Live Server works).
