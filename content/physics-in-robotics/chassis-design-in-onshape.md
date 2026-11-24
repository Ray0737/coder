---
title: Chassis design in Onshape
summary: The body, the wheels and the arm of the robot, drawn in 3D and printed.
---

> [!aha] The robot's body is not bought, it is drawn. The size of every part decides where the motors sit, how far apart the wheels are and how the robot turns, so the CAD and the code have to agree.

## Drawing it in Onshape

The chassis, the wheels and the sensor arm were designed in **Onshape**, a CAD program that runs in the browser, and then 3D-printed. The finished design is one assembly, and the parts are also saved as `.step` files that any CAD program can open.

```cta
cube | The robot in Onshape | The full assembly, which you can rotate and measure in your browser.
Open the Onshape document | https://cad.onshape.com/documents/74141cf14b4e3edbccf8aeed/w/8b6afd6c8bef08f5de8eb482/e/12db100d49e5ac8ae6d900ee?renderMode=0&uiState=698dc4fa336c8f017a6a8bfc | The CAD link
```

> [!more] TLDR: parts and files
> The body, the wheel and the arm are separate parts: `3D Car Body.step`, `3D Wheel.step` and `3D Extension.step`. They are in the course repository next to the drawings.

## Onshape in five ideas

Onshape has a few words that everything else is built from. Learn these and the menus make sense.

| Word | What it is |
|---|---|
| Part Studio | the workspace where you design **parts**, one after another |
| Sketch | a flat drawing on a plane (Top, Front or Right) |
| Feature | a step that builds from a sketch, such as Extrude, Hole or Fillet |
| Assembly | a tab where parts are put together with **mates** |
| Drawing | a sheet with views and dimensions, made from a part or assembly |

> [!more] TLDR: the order of work
> Sketch a shape, turn it into a solid with a feature, repeat for each part, put the parts together in an Assembly, then make a Drawing and export the files.

## Tutorial: the plate

The robot's plate is a round disc, 150 mm across and 5 mm thick, as in the drawing. These are the first steps to make it.

1. In the **Part Studio**, click **Sketch** and choose the **Top** plane.
2. Pick the **Circle** tool, click the middle of the sketch (the origin) and click again to set the size.
3. Pick the **Dimension** tool, click the circle and type `150 mm`. The circle turns black, which means it is fully defined.
4. Click the green tick to finish the sketch.
5. Click **Extrude**, pick the sketch, type `5 mm` and click the green tick.

You now have a solid disc. Every part is made in the same way: a flat shape, then a feature that gives it thickness.

> [!more] TLDR: sketch, dimension, extrude
> Circle, then Dimension, then Extrude is the pattern for most parts. A sketch shows in blue while it is not fully dimensioned, and in black when it is.

## Make it exact: constraints and variables

A sketch is held in shape by **constraints**, rules such as *horizontal*, *vertical*, *equal*, *tangent*, *concentric* and *coincident*. Onshape adds many for you as you draw, and shows them as small icons. Dimensions give the sizes, and constraints give the relations. A good habit is to put the important sizes in **variables**, so one number can be changed in one place and the whole model follows.

```text
#plate_d = 150 mm
#plate_t = 5 mm
#wheel_d = 51 mm
```

Type a variable name with a `#` in a dimension box to use it. In the Part Studio, the variables go in the **Variable** feature.

> [!more] TLDR: variables keep the robot and the code in step
> If the wheel is changed in CAD, the variable changes once and every part that uses it updates. Then copy the same number into `wheelr` and `track` in the code.

## Holes, mirror and fillet

Three features save a lot of drawing. **Hole** makes a drilled hole of an exact size, such as the 10 mm hole in the plate. **Mirror** copies a feature to the other side of a plane, which is how the left motor mount becomes the right one. **Fillet** rounds an edge, and a rounded corner on a printed part is also stronger than a sharp one.

1. Click **Hole**, pick the face, click a point and type the diameter.
2. Click **Mirror**, pick the feature and the mirror plane.
3. Click **Fillet**, pick the edges and type the radius.

> [!more] TLDR: draw half, mirror the rest
> The robot is the same on the left and the right, so draw one side and mirror it. It halves the work and keeps both sides exactly equal.

## Put the parts together

The body, the wheel and the arm are separate parts. In an **Assembly**, click **Insert** to add each part, then connect them with **Mates**. A **Fastened** mate glues two parts together, and a **Revolute** mate lets a part turn about an axis, like a wheel on a motor shaft. Move the parts afterwards to see if they move the way you expect.

> [!more] TLDR: mates decide how parts move
> Fastened means no movement, Revolute means turning and Slider means sliding. Choose the mate that matches the real joint.

## Drawing and export

To make a sheet like the one below, open a new **Drawing** from a part or an assembly, add the Top, Front and Side views, and use the **Dimension** tool to show the sizes. To print a part, right-click it, choose **Export** and select **STL**, which a 3D-print program reads. To share the geometry with other CAD programs, export **STEP**, as in the three `.step` files of the course.

> [!more] TLDR: which file for what
> STL is for 3D printing, STEP is for other CAD programs and a Drawing is for people. The course repository keeps the STEP files and the PDFs.

## Reading the drawing

An engineering drawing shows the same robot from the top, the front and the side, with the size of each part in millimetres. Look at the top view first: it shows the round plate and where the wheels and the ball caster are.

![Engineering drawing of the robot chassis: top, front and side views with dimensions](assets/classworkpic/cad.png)

> [!more] TLDR: the numbers that matter
> The plate is 150 mm across (a 75 mm radius) and 5 mm thick. Each wheel is 25 mm wide, the whole robot is 57.5 mm tall, and a ball caster under the plate keeps the robot level.

## The wheels set the maths

The wheel radius and the distance between the wheels go straight into the formulas from the earlier chapters: `wheelr` in the RPM and `track` for the turns. If a part is changed in CAD and not in the code, the robot will turn the wrong amount.

```cpp
float wheelr = 3.0;    // cm
float track  = 15.0;   // cm
```

> [!more] TLDR: check the constants against the drawing
> The drawing marks a diameter of 51 mm on the wheel, which is a radius of about 2.55 cm, while the code uses 3.0 cm. Measure the printed wheel and the real distance between the wheels before trusting a long route.
