How the backpropagation algorithm works
http://neuralnetworksanddeeplearning.com/chap2.html


The backpropagation algorithm was originally introduced in the 1970s, but its importance wasn't fully appreciated until a famous 1986 paper by David Rumelhart, Geoffrey Hinton, and Ronald Williams. That paper describes several neural networks where backpropagation works far faster than earlier approaches to learning, making it possible to use neural nets to solve problems which had previously been insoluble. Today, the backpropagation algorithm is the workhorse of learning in neural networks.

This chapter is more mathematically involved than the rest of the book. If you're not crazy about mathematics you may be tempted to skip the chapter, and to treat backpropagation as a black box whose details you're willing to ignore. Why take the time to study those details?

cost function | Hadamard product

The backpropagation equations provide us with a way of computing the gradient of the cost function. Let's explicitly write this out in the form of an algorithm:

Input x: Set the corresponding activation a1 for the input layer.

Feedforward: For each l=2,3,…,L compute zl=wlal−1+bl and al=σ(zl).

Output error δL: Compute the vector δL=∇aC⊙σ′(zL).

Backpropagate the error: For each l=L−1,L−2,…,2compute δl=((wl+1)Tδl+1)⊙σ′(zl).

Output: The gradient of the cost function is given by ∂C∂wljk=al−1kδlj
and ∂C∂blj=δlj.