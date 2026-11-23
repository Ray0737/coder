---
title: Pandas: tables
summary: Load a spreadsheet into Python, ask it questions, clean it, and hand it to a model.
---

> [!aha] NumPy holds plain grids of numbers. Real data comes as a **table**: columns with names, rows of records, some text, some numbers, some blanks. **Pandas** is a spreadsheet you control with code, and it is how most machine-learning projects start.

## Install and import

```bash
pip install pandas
```

```python
import pandas as pd
```

## A DataFrame: the table

A **DataFrame** is a table. Each column has a name, and each row has a number called the **index**. You can build one from a dictionary, where each key is a column. A single column on its own is a **Series**, a labelled list, and `NaN` means "not a number", Pandas' mark for a missing value.

```python
import pandas as pd

df = pd.DataFrame({
    "fruit": ["apple", "banana", "cherry", "mango"],
    "price": [12, 5, 40, 25],
    "stock": [50, 120, None, 30],      # None is a missing value
})
print(df)
```

```
    fruit  price  stock
0   apple     12   50.0
1  banana      5  120.0
2  cherry     40    NaN
3   mango     25   30.0
```


## Load a file

Real data lives in a file. `read_csv` loads a CSV (comma separated values) file, and `to_csv` saves one. `pd.read_excel("file.xlsx")` reads Excel files, and needing it will tell you to also install `openpyxl`.

```python
df = pd.read_csv("iris.csv")
df.to_csv("clean.csv", index=False)      # index=False leaves out the row numbers
```

## First look at any new table

Do these five before anything else. They answer "what did I just load?".

| Call | Shows |
|---|---|
| `df.head()` | the first 5 rows (`df.tail()` for the last) |
| `df.shape` | `(rows, columns)`, such as `(4, 3)` |
| `df.info()` | each column's name, type and how many values are not missing |
| `df.describe()` | count, mean, spread and quartiles of every number column |
| `df.columns` | the column names |

## Ask the table a question

The same questions work every time: pick a column, filter rows, sort, group. Press each one.

```widget
dfviz
```

> [!compare] Think of it like a spreadsheet with a magic remote. Pick a column is clicking the column letter, filter is "show only rows where...", sort is clicking the header arrow, and groupby is a pivot table that makes one row per group.

## The common questions in code

The condition works because, like NumPy, `df["price"] > 10` gives a column of `True` and `False`, and the outer brackets keep the rows marked `True`. It is the mask from the NumPy chapter. `df["price"]` is one column, a list of column names in double brackets gives a smaller table, a condition keeps the matching rows, two conditions combine with `&` or `|`, and `sort_values` orders the rows.

```python
df["price"]                          # one column (a Series)
df[["fruit", "price"]]               # several columns: note the double brackets
df[df["price"] > 10]                 # only the rows where the condition is True
df[(df["price"] > 10) & (df["stock"] > 40)]    # two conditions: & is and, | is or
df.sort_values("price", ascending=False)       # biggest first
```

> [!warn] When you combine conditions, wrap each one in its own **brackets** and use `&` and `|`, not the words `and` and `or`. Writing `df[df["a"] > 1 and df["b"] > 2]` stops with `ValueError: The truth value of a Series is ambiguous`.

## Picking by label or by position

`loc` picks by the names on the table, and `iloc` picks by counting from 0.

| Call | Picks by | Example | Gives |
|---|---|---|---|
| `df.loc[row, column]` | **label** (names and index numbers) | `df.loc[1, "price"]` | `5` |
| `df.iloc[row, column]` | **position** (counting from 0) | `df.iloc[0, 0]` | `'apple'` |

## New columns and maths

A new column is just an assignment. The maths runs down the whole column at once, like NumPy.

```python
df["value"] = df["price"] * df["stock"]
print(df["price"].max())          # 40
print(df["price"].mean())         # 20.5
```

## Missing values

Real data always has gaps. Find them, then decide: fill them or drop them. `isna().sum()` counts the gaps in each column. You can then fill them with a fixed number (`fillna(0)`), fill them with the column's average, or throw away every row that has a gap with `dropna()`.

```python
print(df.isna().sum())            # missing values per column (stock: 1)

df["stock"] = df["stock"].fillna(0)                      # fill gaps with 0
df["stock"] = df["stock"].fillna(df["stock"].mean())     # or fill with the average
df = df.dropna()                                         # or drop rows that have a gap
```

> [!warn] Fill or drop in a way that makes sense for the data. Filling missing prices with 0 pulls your average down and can mislead you. Check how many values are missing **before** you choose.

## Count and group

`value_counts` counts the rows of each value, and `groupby` splits the table into groups, calculates for each group, and joins the answers, so `df.groupby("species").mean()` is the table shown in the diagram above.

```python
df["species"].value_counts()               # how many rows of each value
df.groupby("species")["petal_length"].mean()   # average petal length for each species
```

## From table to model

For machine learning, you split the table into the **features** (the inputs) and the **label** (the answer), as in the Data handling chapter. Many libraries accept these directly, or as arrays with `X.to_numpy()`.

```python
X = df[["sepal_length", "petal_length"]]     # features: a table of inputs
y = df["species"]                            # label: a column of answers
```

## Try it

1. Build a DataFrame of 4 fruits with a name and a price. Print the most expensive one.
2. Use `df[df["price"] > 10]` to keep only the dearer fruits.
3. Add a column `price_with_tax` that is the price times 1.07.
4. Make one stock value missing, count it with `isna().sum()`, then fill it with 0.
5. What is the difference between `df.loc[1, "price"]` and `df.iloc[1, 1]`?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `DataFrame` | a spreadsheet in code | a table of named columns |
| `Series` | one column | a labelled list |
| `read_csv` / `to_csv` | opening / saving the file | loads and saves tables |
| `head`, `info`, `describe` | a first glance | summarise a new table |
| `df[df["x"] > 5]` | "show only rows where..." | filters rows |
| `sort_values` | clicking the header arrow | orders the rows |
| `groupby` | a pivot table | one result per group |
| `isna`, `fillna`, `dropna` | spotting and mending gaps | handles missing values |
