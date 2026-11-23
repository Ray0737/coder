---
title: Unsupervised learning
summary: Learning with no answer key: K-means finds the groups in the data, and PCA finds the few numbers that matter.
---

> [!aha] Unsupervised learning is the other half of machine learning: the data has features but no labels, so there is nothing to score against. The model has to find structure on its own, and the two classic jobs are grouping similar points (clustering) and squeezing many columns into a few (dimensionality reduction).

## No answer key

Every chapter so far had labels: spam or not spam, a price to predict, a known answer to check against. Here the data comes with **features only**, so nobody tells the model what the "right" result looks like, and "learning" means finding a pattern worth reporting. That makes it useful when labels are expensive or do not exist yet, such as grouping customers by behaviour or compressing a photo collection. The price is that there is no accuracy score to check: whether a grouping is good is a judgement about whether it is useful.

| | Clustering (K-means) | Dimensionality reduction (PCA) |
|---|---|---|
| Question | Which points belong together? | Which few numbers keep most of the information? |
| Output | A group number for every point | A short list of new numbers for every point |
| Used for | Customer segments, grouping photos | Plotting, faster training, less overfitting |

> [!compare] Think of sorting a pile of mail that has no address labels. Nobody tells you which pile is right, so you sort by what looks alike and then decide whether the piles make sense.

## K-means: join the nearest centre, then move the centre

**K-means** finds **K** groups by repeating one simple move until nothing changes. Drop K centres (**centroids**) at random spots, let every point join the nearest centre, then move each centre to the average position of its group, and repeat. You have to choose K yourself, because K-means does not discover how many groups there are. Pick K below and step through the iterations, and notice the last line, which lists how the total distance to the centres falls as K grows.

```widget
kmeanscluster
```

> [!compare] Think of K new students dropped at random spots in a crowded room. Everyone walks to the nearest student, then each of the K students walks to the middle of the crowd around them. Repeat, and both the groups and the students settle into place.

> [!more] TLDR: choosing K, and when K-means goes wrong
> The total squared distance to the centres always falls as K grows, since more centres mean closer ones (with K equal to the number of points it is zero), so the lowest number is not the goal. The **elbow** is the K where the drop suddenly flattens: in the diagram it falls steeply up to K = 3 and barely after, which matches how the data was made. If the elbow is not clear, the data may not have clean groups.
>
> It also has weak spots. The start matters, since two centres that begin close together can end up splitting one group, so real code reruns it several times (or starts smartly, with **k-means++**). It assumes round, similar-sized blobs, and it uses distance, so features must be scaled first. For odd shapes, other methods like DBSCAN or hierarchical clustering do better.

> [!more] Math: what K-means is minimising
> It lowers one number, the total squared distance from every point to its own centre (called the **inertia**), where `μⱼ` is the centre of group `Cⱼ`:
>
> ```math
> inertia = Σⱼ Σ over x in Cⱼ of  ‖x − μⱼ‖²
> ```
>
> Both steps can only lower it or leave it unchanged. Moving every point to its nearest centre cannot raise the total, and moving a centre to the average of its group gives the smallest possible sum of squared distances for that group, which is the same "average minimises squared error" fact behind linear regression. Since it never goes up and there are finitely many ways to group the points, it must stop. It may stop at a local minimum rather than the best grouping, which is why a different start can give a different answer.

## PCA: fewer numbers, almost nothing lost

If two features move together strongly, you do not really have two pieces of information but one piece measured twice. **Principal component analysis (PCA)** looks at the cloud of points and finds the straight line through it along which the points are most spread out, the direction of greatest **variance**. That line is the **first principal component (PC1)**, and dropping each point onto it turns two numbers into one while losing as little as possible. Turn the axis below and see how much of the spread each angle keeps, then snap to PC1.

```widget
pcavariance
```

> [!compare] Think of photographing a flat sheet of paper. Shoot it straight on and you lose almost nothing, but shoot it edge-on and the photo is just a line, with all the useful spread gone. PCA finds the angle that keeps the most of the paper visible.

> [!more] TLDR: why fewer numbers help, and what PCA is not
> Real datasets have dozens or hundreds of features, many of them overlapping. Fewer, better numbers per example mean faster training, a dataset you can actually plot (squeeze to 2 numbers and draw it), and less overfitting from a model chasing noise in redundant columns. Keep as many components as it takes to hold, say, 90 to 95% of the spread.
>
> Two warnings. PCA only finds straight directions, so a curved pattern needs other methods, and the new numbers are blends of the old features, so they are harder to explain than the original columns. Scale the features first, or the one with the biggest numbers will dominate.

> [!more] Math: PC1 as an eigenvector, and variance explained
> Centre the data (subtract each feature's average), then compute the **covariance matrix** `Σ`, which records how much every pair of features varies together. The principal components are its **eigenvectors**, and each one's eigenvalue `λ` is the variance along it:
>
> ```math
> Σ · v = λ · v          variance explained by a component = λ / (sum of all λ)
> ```
>
> The eigenvector with the biggest `λ` is PC1, the next biggest (perpendicular to it) is PC2, and so on. For the 30 points in the diagram PC1 sits at about 39° and keeps 93.3% of the spread, so one number per point replaces two and loses only 6.7%. The default axis at 90° keeps only 40.5%. The projection of a point `x` onto a unit direction `v` is the single number `v · x`.

## Try it

1. In the K-means diagram, set K = 3 and step through every iteration. Does any point change group after iteration 1?
2. Set K = 2, then K = 5. What does each do to a dataset that really has three blobs?
3. Why does moving a centre to the average of its group make sense as the next guess for the true centre?
4. Read the total-distance line for K = 1 to 6. Where is the elbow, and why would picking K = 6 only because it has the smallest number be a mistake?
5. In the PCA diagram, turn the axis to 0° and then to 90°. Which keeps more of the spread, and why?
6. If the points formed a perfect circle instead of a tilted oval, what would you expect PC1's share of the spread to be?
7. Name one real pair of features that move together, like height and shoe size, where PCA would lose very little.

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Unsupervised learning | Sorting mail with no address labels | Finds structure in data that has no answer key |
| Centroid | A meeting point everyone walks toward | The current centre of one cluster |
| K | How many groups you decide to look for | Chosen before running K-means, not discovered by it |
| Inertia and the elbow | Total walking distance, and where it stops shrinking fast | A score for a grouping, and a hint for choosing K |
| Dimensionality reduction | Summarising a long report in one paragraph | Fewer numbers per example, keeping most of the information |
| Principal component | The best angle to photograph tilted paper | The direction through the data with the most spread |
| Variance explained | How much of the paper one photo shows | How much information one component keeps |
