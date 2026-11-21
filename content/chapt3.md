Improving the way neural networks learn
http://neuralnetworksanddeeplearning.com/chap3.html


The techniques we'll develop in this chapter include: a better choice of cost function, known as the cross-entropy cost function; four so-called "regularization" methods (L1 and L2 regularization, dropout, and artificial expansion of the training data), which make our networks better at generalizing beyond the training data; a better method for initializing the weights in the network; and a set of heuristics to help choose good hyper-parameters for the network. I'll also overview several other techniques in less depth. The discussions are largely independent of one another, and so you may jump ahead if you wish. We'll also implement many of the techniques in running code, and use them to improve the results obtained on the handwriting classification problem studied in Chapter 1.


Introducing the cross-entropy cost function

How can we address the learning slowdown? It turns out that we can solve the problem by replacing the quadratic cost with a different cost function, known as the cross-entropy. To understand the cross-entropy, let's move a little away from our super-simple toy model. We'll suppose instead that we're trying to train a neuron with several input variables, x1,x2,…, corresponding weights w1,w2,…, and a bias, b:


What does the cross-entropy mean? Where does it come from?

Our discussion of the cross-entropy has focused on algebraic analysis and practical implementation. That's useful, but it leaves unanswered broader conceptual questions, like: what does the cross-entropy mean? Is there some intuitive way of thinking about the cross-entropy? And how could we have dreamed up the cross-entropy in the first place?

Let's begin with the last of these questions: what could have motivated us to think up the cross-entropy in the first place? Suppose we'd discovered the learning slowdown described earlier, and understood that the origin was the σ′(z) terms in Equations (55) and (56). After staring at those equations for a bit, we might wonder if it's possible to choose a cost function so that the σ′(z) term disappeared. In that case, the cost C=Cx for a single training example x would satisfy






Softmax


The idea of softmax is to define a new type of output layer for our neural networks. It begins in the same way as with a sigmoid layer, by forming the weighted inputs

**In describing the softmax we'll make frequent use of notation introduced in the last chapter. You may wish to revisit that chapter if you need to refresh your memory about the meaning of the notation. 

zLj=∑kwLjkaL−1k+bLj. However, we don't apply the sigmoid function to get the output. Instead, in a softmax layer we apply the so-called softmax function to the zLj. According to this function, the activation aLj of the jth output neuron is
aLj=ezLj∑kezLk,(78)
where in the denominator we sum over all the output neurons.

Softmax = One Pie Chart. You have a fixed 100% pie, and all the classes have to split that single pie among themselves. If "Cat" gets a bigger slice (say 80%), "Dog" and "Bird" must get smaller slices (20% left to share).

Sigmoid = Separate Progress Bars. Every class gets its own independent 0% to 100% bar. "Cat" can be 90% full, and "Dog" can also be 85% full at the exact same time—neither steals from the other.






Overfitting and regularization


