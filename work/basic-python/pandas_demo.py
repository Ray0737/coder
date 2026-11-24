# ===== Imports =====
import numpy as np
import pandas as pd

# ===== Example 1: build a table, inspect it and clean it =====
df = pd.DataFrame({
    "name":  ["Ann", "Ben", "Cara", "Dev", "Eli", "Fay", "Ben"],
    "class": ["A", "B", "A", "C", "B", "A", "B"],
    "score": [82.0, 74.0, np.nan, 91.0, 68.0, 77.0, 74.0],       # nan is a missing value
    "hours": [5, 3, 4, 8, 2, 4, 3],
})
print(df.shape)
df.info()
print(df.describe().round(1))                       # count, mean, spread and quartiles of the number columns

print("missing per column:\n", df.isna().sum())
print("duplicate rows:", df.duplicated().sum())

clean = df.drop_duplicates()                        # Ben appears twice with the same row
clean = clean.assign(score=clean["score"].fillna(clean["score"].mean()))   # fill the gap with the average
clean["grade"] = np.select([clean["score"] >= 85, clean["score"] >= 70],   # first true condition wins
                           ["A", "B"], default="C")
print(clean.sort_values("score", ascending=False))

# ===== Example 2: filter, group and summarise =====
sales = pd.DataFrame({
    "shop":  ["north", "north", "south", "south", "east", "east", "north", "south"],
    "item":  ["tea", "coffee", "tea", "coffee", "tea", "coffee", "tea", "tea"],
    "units": [30, 45, 22, 51, 18, 40, 25, 31],
    "price": [40, 55, 40, 55, 40, 55, 40, 40],
})
sales["income"] = sales["units"] * sales["price"]           # a new column: maths on whole columns

print("tea sold over 25 units:")
print(sales[(sales["item"] == "tea") & (sales["units"] > 25)])   # each condition in brackets, & for and
print("north or east:", len(sales[sales["shop"].isin(["north", "east"])]), "rows")

print(sales.groupby("shop")["income"].sum())                # one total per shop
by_item = sales.groupby("item").agg(units=("units", "sum"), best_day=("units", "max"), rows=("units", "count"))
print(by_item)
print(sales["item"].value_counts())                         # how many rows of each value
top = sales.groupby("shop")["income"].sum().idxmax()
print("best shop:", top)

# ===== Example 3: from a table to model inputs =====
data = pd.DataFrame({
    "height": [150, 160, 172, 181, 165, 158, 190, 175],
    "weight": [50, 58, 70, 85, 62, 54, 95, 72],
    "city":   ["bkk", "cnx", "bkk", "hkt", "cnx", "bkk", "hkt", "cnx"],
    "label":  [0, 0, 1, 1, 0, 0, 1, 1],
})

X = data[["height", "weight", "city"]]               # features: a table of inputs
y = data["label"]                                    # label: a column of answers

X = pd.get_dummies(X, columns=["city"], dtype=int)   # text categories become 0/1 columns
numbers = ["height", "weight"]
X[numbers] = (X[numbers] - X[numbers].mean()) / X[numbers].std()    # scale: mean 0, spread 1
print(X.round(2).head(3))

test = data.sample(frac=0.25, random_state=0).index  # pick 25% of the rows for testing, the same ones every run
X_train, y_train = X.drop(test), y.drop(test)
X_test, y_test = X.loc[test], y.loc[test]
print("train:", len(X_train), "rows | test:", len(X_test), "rows | test rows:", sorted(test.tolist()))

array = X_train.to_numpy()                            # many libraries want a plain array
print("as an array:", array.shape, array.dtype)

X_train.assign(label=y_train).to_csv("train.csv", index=False)
print(pd.read_csv("train.csv").shape, "read back from train.csv")
