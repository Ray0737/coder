my AI ML ball knowledge 
http://neuralnetworksanddeeplearning.com/chap1.html

Perception


What is a neural network? To get started, I'll explain a type of artificial neuron called a perceptron. Perceptrons were developed in the 1950s and 1960s by the scientist Frank Rosenblatt, inspired by earlier work by Warren McCulloch and Walter Pitts.

the main neuron model used is one called the sigmoid neuron

A perceptron takes several binary inputs, x1,x2,…
, and produces a single binary output:

Rosenblatt proposed a simple rule to compute the output. He introduced weights, w1,w2,…, real numbers expressing the importance of the respective inputs to the output. The neuron's output, 0 or 1, is determined by whether the weighted sum ∑jwjxj is less than or greater than some threshold value.

Obviously, the perceptron isn't a complete model of human decision-making! But what the example illustrates is how a perceptron can weigh up different kinds of evidence in order to make decisions.

Let's simplify the way we describe perceptrons. The condition ∑jwjxj>threshold is cumbersome, and we can make two notational changes to simplify it. The first change is to write ∑jwjxj as a dot product, w⋅x≡∑jwjxj
, where w and x are vectors whose components are the weights and inputs, respectively. The second change is to move the threshold to the other side of the inequality, and to replace it by what's known as the perceptron's bias, b≡−threshold. Using the bias instead of the threshold, the perceptron rule can be rewritten: 

w⋅x+b≤0 w⋅x+b>0 (use this for easier expression) w⋅x≤threshold w⋅x>threshold

You can think of the bias as a measure of how easy it is to get the perceptron to output a 1. Or to put it in more biological terms, the bias is a measure of how easy it is to get the perceptron to fire. For a perceptron with a really big bias, it's extremely easy for the perceptron to output a 1
. But if the bias is very negative, then it's difficult for the perceptron to output a 1.

I've described perceptrons as a method for weighing evidence to make decisions. Another way perceptrons can be used is to compute the elementary logical functions we usually think of as underlying computation, functions such as AND, OR, and NAND. 






Sigmoid neurons


To see how learning might work, suppose we make a small change in some weight (or bias) in the network. What we'd like is for this small change in weight to cause only a small corresponding change in the output from the network. 

If it were true that a small change in a weight (or bias) causes only a small change in output, then we could use this fact to modify the weights and biases to get our network to behave more in the manner we want. For example, suppose the network was mistakenly classifying an image as an "8" when it should be a "9". We could figure out how to make a small change in the weights and biases so the network gets a little closer to classifying the image as a "9". And then we'd repeat this, changing the weights and biases over and over to produce better and better output. The network would be learning.

The problem is that this isn't what happens when our network contains perceptrons. In fact, a small change in the weights or bias of any single perceptron in the network can sometimes cause the output of that perceptron to completely flip, say from 0 to 1. That flip may then cause the behaviour of the rest of the network to completely change in some very complicated way. So while your "9" might now be classified correctly, the behaviour of the network on all the other images is likely to have completely changed in some hard-to-control way. That makes it difficult to see how to gradually modify the weights and biases so that the network gets closer to the desired behaviour. Perhaps there's some clever way of getting around this problem. But it's not immediately obvious how we can get a network of perceptrons to learn.


sigmoid neuron. Sigmoid neurons are similar to perceptrons, but modified so that small changes in their weights and bias cause only a small change in their output.


Just like a perceptron, the sigmoid neuron has inputs, x1,x2,…. But instead of being just 0 or 1, these inputs can also take on any values between 0 and 1. So, for instance, 0.638… is a valid input for a sigmoid neuron. Also just like a perceptron, the sigmoid neuron has weights for each input, w1,w2,…, and an overall bias, b. But the output is not 0 or 1. Instead, it's σ(w⋅x+b)
, where σ is called the sigmoid function

**Incidentally, σ is sometimes called the logistic function, and this new class of neurons called logistic neurons. It's useful to remember this terminology, since these terms are used by many people working with neural nets. However, we'll stick with the sigmoid terminology.


If σ had in fact been a step function, then the sigmoid neuron would be a perceptron, since the output would be 1 or 0 depending on whether w⋅x+b was positive or negative


**Actually, when w⋅x+b=0 the perceptron outputs 0, while the step function outputs 1. So, strictly speaking, we'd need to modify the step function at that one point. But you get the idea.. 


By using the actual σ function we get, as already implied above, a smoothed out perceptron. Indeed, it's the smoothness of the σ function that is the crucial fact, not its detailed form. The smoothness of σ means that small changes Δwj in the weights and Δb in the bias will produce a small change Δoutput in the output from the neuron. In fact, calculus tells us that Δoutput is well approximated by Δoutput≈∑j∂output∂wjΔwj+∂output∂bΔb,

How should we interpret the output from a sigmoid neuron? Obviously, one big difference between perceptrons and sigmoid neurons is that sigmoid neurons don't just output 0 or 1. They can have as output any real number between 0 and 1, so values such as 0.173… and 0.689… are legitimate outputs. 

This can be useful, for example, if we want to use the output value to represent the average intensity of the pixels in an image input to a neural network. But sometimes it can be a nuisance. Suppose we want the output from the network to indicate either "the input image is a 9" or "the input image is not a 9". Obviously, it'd be easiest to do this if the output was a 0 or a 1, as in a perceptron. But in practice we can set up a convention to deal with this, for example, by deciding to interpret any output of at least 0.5 as indicating a "9", and any output less than 0.5 as indicating "not a 9". I'll always explicitly state when we're using such a convention, so it shouldn't cause any confusion.





The architecture of neural networks


As mentioned earlier, the leftmost layer in this network is called the input layer, and the neurons within the layer are called input neurons. The rightmost or output layer contains the output neurons, or, as in this case, a single output neuron. The middle layer is called a hidden layer, since the neurons in this layer are neither inputs nor outputs.

The network above has just a single hidden layer, but some networks have multiple hidden layers

Somewhat confusingly, and for historical reasons, such multiple layer networks are sometimes called multilayer perceptrons or MLPs, despite being made up of sigmoid neurons, not perceptrons

The design of the input and output layers in a network is often straightforward. For example, suppose we're trying to determine whether a handwritten image depicts a "9" or not. A natural way to design the network is to encode the intensities of the image pixels into the input neurons. If the image is a 64 by 64 greyscale image, then we'd have 4,096=64×64 input neurons, with the intensities scaled appropriately between 0 and 1. The output layer will contain just a single neuron, with output values of less than 0.5 indicating "input image is not a 9", and values greater than 0.5 indicating "input image is a 9 "

Up to now, we've been discussing neural networks where the output from one layer is used as input to the next layer. Such networks are called feedforward neural networks. This means there are no loops in the network - information is always fed forward, never fed back. If we did have loops, we'd end up with situations where the input to the σ function depended on the output. That'd be hard to make sense of, and so we don't allow such loops.

However, there are other models of artificial neural networks in which feedback loops are possible. These models are called recurrent neural networks. The idea in these models is to have neurons which fire for some limited duration of time, before becoming quiescent. That firing can stimulate other neurons, which may fire a little while later, also for a limited duration. That causes still more neurons to fire, and so over time we get a cascade of neurons firing. Loops don't cause problems in such a model, since a neuron's output only affects its input at some later time, not instantaneously.

Time-stamped / sequential data (RNN shines): When data unfolds over time—like live sensor readings, audio waveforms, stock prices, or words in a sentence—each new step ($t=1, 2, 3$) brings new information that depends on what just happened a moment ago. Feeding the previous hidden state ($h_{t-1}$) forward acts as short-term memory across those changing timestamps.





A simple network to classify handwritten digits


We can split the problem of recognizing handwritten digits into two sub-problems. First, we'd like a way of breaking an image containing many digits into a sequence of separate images, each containing a single digit. 

The input layer of the network contains neurons encoding the values of the input pixels. As discussed in the next section, our training data for the network will consist of many 28 by 28 pixel images of scanned handwritten digits, and so the input layer contains 784=28×28 neurons. For simplicity I've omitted most of the 784 input neurons in the diagram above. The input pixels are greyscale, with a value of 0.0 representing white, a value of 1.0 representing black, and in between values representing gradually darkening shades of grey.

we see how much it trigger during the train then use that neron activation to adjust weight bias to use the correct more threshold ?

To understand why we do this, it helps to think about what the neural network is doing from first principles. Consider first the case where we use 10 output neurons. Let's concentrate on the first output neuron, the one that's trying to decide whether or not the digit is a 0. It does this by weighing up evidence from the hidden layer of neurons.

In Michael Nielsen's supervised digit-recognition setup on this page, a $28 \times 28$ handwritten image from the MNIST data set is flattened into 784 pixel values and pushed forward through hidden and output layers made of sigmoid neurons rather than hard-threshold perceptrons. At each step after the input layer, neurons compute a weighted sum plus bias and pass it through the smooth sigmoid activation function $\sigma(z) = \frac{1}{1 + e^{-z}}$, producing continuous values between 0 and 1 instead of abrupt jumps so small weight and bias changes produce smooth, predictable changes in output. The output layer itself has 10 neurons (one for each digit 0 through 9) with no built-in threshold gate; for a single digit guess, we simply pick the neuron index with the highest activation via np.argmax (whereas a fixed threshold like 0.5 is used as an interpretation rule for binary yes/no outputs). During training, the network compares its output activations against the known label vector $y(x)$ using the quadratic cost function $C$, and uses gradient descent (mini-batch stochastic gradient descent with backpropagation) to nudge the weights and biases downhill toward lower cost.





Learning with gradient descent


What we'd like is an algorithm which lets us find weights and biases so that the output from the network approximates y(x) for all training inputs x. 

*Sometimes referred to as a loss or objective function. We use the term cost function throughout this book, but you should note the other terminology, since it's often used in research papers and other discussions of neural networks.

Instead of using evaluate to grade a single yes/no or digit guess on frozen weights, training with gradient descent on this page adjusts the network's weights and biases $v = (v_1, v_2, \dots)$ to lower the quadratic cost function $C(v) = \frac{1}{2n}\sum_x \Vert{}y(x) - a\Vert{}^2$, which measures how wrong the output activations $a$ (shaped by hidden and output layer activations) are compared to the true labels $y(x)$. You can picture the whole parameter space as a 3D valley landscape where moving across the ground changes the weights/biases, height shows how high the cost ("suckiness") is, peaks are terrible guesses, and low spots are lower cost—while in real networks there are far more than two coordinates like $v_1$ and $v_2$. At each step, gradient descent computes the gradient $\nabla C$ (using backpropagation per example and averaging across a full dataset or a fast random mini-batch sample) and moves in the opposite direction ($\Delta v = -\eta \nabla C$ with learning rate $\eta$) for steepest immediate descent, rolling a ball from its starting spot toward a low valley ("hole")—though local slopes and starting points can land it in a good valley or shallower dip rather than guaranteeing the single deepest point on the entire map.

