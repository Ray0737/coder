// Work page: the real code files for each class, in a sidebar tree that keeps the same year > class > section shape as Main.
// A file opens as one code window on the left (the whole file, line numbers, the picked cell highlighted) with "What this cell does" and its output on the right.
// A chapter that has work lists its files; a chapter without any shows dimmed.
// To add work: copy the file into work/<class-slug>/ and add it here. See work/README.md.
// The file is read with fetch, so the site has to be served (see content/README.md).

// A file is cut into cells at lines like "#Q1" or "# Exercise 3-4" (cutAt). The text before the first one is the header cell.
// does[i] describes cell i (header first). outs[i] is the output of cell i, when it has one that never changes.
const WORK = {
  'computer-vision/reading-and-displaying': [
    {
      file: 'basics.py', title: 'OpenCV walkthrough', cutLines: [30, 39, 54, 68, 86, 101, 135, 157, 187, 209, 227, 250],
      labels: ['Imports and paths', '1. Read and show an image', '2. Read and show a video', '3. Rescale by a factor', '4. Resize', '5. Draw shapes and text', '6. Transforms', '7. Color spaces', '8. Vision pipeline', '9. Color channels', '10. Bitwise', '11. Sobel and Laplacian', '12. Mouse click events'],
      note: 'OpenCV: a full 12-step walkthrough.',
      does: [
        "A walkthrough of the basic OpenCV commands, written plainly from top to bottom with no helper module. The file finds the assets folder from its own location, so it runs from any folder. Every cv.imshow plus cv.waitKey(0) pauses until a key is pressed, and the video part quits on d.",
        "cv.imread(path, 1) loads the picture in colour (BGR), 0 would load it grey and -1 keeps transparency. imshow opens a window, waitKey(0) waits for a key, and destroyAllWindows closes it.",
        "VideoCapture takes a file path, or 0 for the webcam. The loop reads one frame at a time, and read() returns False when the video ends. waitKey(20) shows each frame for 20 ms, and pressing d breaks out. release() frees the file.",
        "rescale() scales a picture by a factor: the new width and height are the old ones times the scale, and INTER_AREA is the good choice for shrinking. It works on a picture or on a video frame.",
        "Two ways to resize. cv.resize takes the exact size as (width, height). The second way uses an affine matrix whose diagonal is 0.5, so warpAffine shrinks the picture to half, the same idea as the translate and rotate matrices later.",
        "np.zeros((500, 500, 3)) makes a black canvas. rectangle, circle, line and putText draw on it with colours in B, G, R order, and a thickness of -1 would fill a shape.",
        "Crop is just array slicing, img[y1:y2, x1:x2]. translate() moves the picture with the matrix [[1, 0, x], [0, 1, y]]. rotate() turns it around the centre with getRotationMatrix2D, where a positive angle is counter-clockwise. flip uses 0 for upside-down, 1 for left-right and -1 for both.",
        "cvtColor converts to grey, HSV, LAB and RGB. matplotlib wants RGB, which is why the last picture is converted before plt.imshow.",
        "The classic pipeline: grey, then a Gaussian blur with an odd kernel, then Canny edges. A threshold is shown as the alternative, dilate and erode thicken and thin the edges, and findContours turns the edges into shapes. The contours are drawn in red on a three-channel black canvas.",
        "split gives the three channels as grey pictures. To show a channel in its own colour, it is merged with two blank channels. merge([b, g, r]) puts the original back together.",
        "Two shapes drawn as white fills on black canvases of the same size, and then bitwise and (the overlap), or (both), xor (the part that differs) and not (inverted). The inputs must be the same size.",
        "Sobel measures the gradient in one direction: it is computed in CV_64F so negative values survive, then convertScaleAbs takes the absolute value. Sobel x finds vertical edges, Sobel y horizontal ones, and bitwise_or combines them. Laplacian finds edges in every direction at once.",
        "A mouse callback runs on every mouse action over a window, with the fixed signature (event, x, y, flags, param). Here a left click draws a green dot where you clicked and redraws the window. The window must exist first, setMouseCallback attaches the function, and waitKey keeps the window alive.",
      ],
      outs: [],
    },
    {
      file: 'overlay.py', title: 'Webcam overlay', cutLines: [7, 14, 22, 35],
      labels: ['Imports and the camera', 'Read a frame and the time', 'Draw the shapes', 'Draw the clock', 'Show, quit and release'],
      note: 'OpenCV: shapes and a live clock.',
      does: [
        "Imports OpenCV and datetime, and opens the default webcam with VideoCapture(0).",
        "The loop runs while the camera is open. read() returns ret (False when no frame arrived) and the frame, an array of height by width by 3. h and w are the frame size, and strftime turns the current time into text like 14:03:09.",
        "center_x and center_y are the middle of the frame, found with // so they stay whole numbers. circle draws a filled green circle of radius 50 there (a thickness of -1 means fill), line draws a red diagonal from the top-left corner to the bottom-right, and rectangle draws a thick blue border 10 pixels in from the edge. Colours are in B, G, R order.",
        "putText writes 'live: ' and the time. Its arguments are the frame, the text, the position of the bottom-left corner of the text, the font, the size, the colour (black, although the comment says white), the thickness and LINE_AA for smooth edges. The text is drawn on every frame, so the clock updates.",
        "imshow shows the frame, and waitKey(33) waits about 33 ms, which gives roughly 30 frames per second, and returns the key pressed. Pressing d breaks out of the loop. When the loop ends the camera is released and the windows are closed.",
      ],
      outs: [],
    },
  ],
  'computer-vision/mouse-events': [
    {
      file: 'ellipse.py', title: 'Draw an ellipse', cutLines: [6, 17, 66],
      labels: ['Header and imports', 'State and canvases', 'The mouse callback', 'The window and the loop'],
      note: 'OpenCV: draw ellipses with the mouse.',
      does: [
        "Click, drag and release to draw an ellipse, with a thin white preview while dragging.",
        "drawing, start_point and end_point remember the state of the drag. canvas keeps the finished ellipses, and display_img is the picture shown on screen, a copy of the canvas plus the preview.",
        "On press, the start point is stored. While the mouse moves with the button down, the display image is reset from the canvas and a preview ellipse is drawn: the centre is the middle of the two corners and the two half-axes are half the width and height of the dragged box. On release, the final ellipse is drawn onto the canvas with a random colour and a thickness of 6, but only if it is bigger than one pixel.",
        "namedWindow and setMouseCallback connect the function to the window, and the loop keeps showing display_img until q or Esc is pressed.",
      ],
      outs: [],
    },
  ],
  'computer-vision/color-spaces': [
    {
      file: 'picker.py', title: 'BGR colour picker', cutLines: [14, 23, 49],
      labels: ['Load the picture', 'rescaleFrame()', 'The click callback', 'The window and the loop'],
      note: 'OpenCV: click a pixel for its BGR.',
      does: [
        "Loads a picture with imread. If it could not be read, imread gives None, so the script prints a message and exits instead of crashing later.",
        "rescaleFrame shrinks a picture by a factor: the new width and height are the old ones times the scale (shape[1] is the width, shape[0] the height), and INTER_AREA is the interpolation made for shrinking. The picture is shown at half size.",
        "On a left click, the callback reads the pixel img[y, x], with the row first, and gets its blue, green and red values. It prints them, then draws on a fresh copy of the shrunk picture: the BGR text next to the click with putText and a small red dot with circle. Because the colour is read from the full-size picture but the click comes from the shrunk one, the value belongs to a different pixel than the dot.",
        "namedWindow and setMouseCallback connect the function to the window. The loop keeps showing the picture, so each click redraws on top of it, and pressing q ends it.",
      ],
      outs: [],
    },
    {
      file: 'hsv_mask.py', title: 'Three colours on the webcam', cutLines: [7, 12, 26, 31],
      labels: ['Imports and the camera', 'Read a frame and convert to HSV', 'Three colour masks', 'Join the masks and cut out the colours', 'Show, quit and release'],
      note: 'OpenCV: live HSV colour masks.',
      does: [
        "Imports OpenCV and NumPy, and opens the webcam.",
        "Each loop pass reads a frame and converts it from BGR to HSV, the colour space where one number, the hue, says which colour it is.",
        "Three inRange masks, each white where a pixel is inside the range. White has any hue (0 to 180), low saturation (up to 40) and high value (200 up), because white is a very pale, bright colour. Yellow is hue 20 to 32 with strong saturation and value. Green is hue 35 to 85.",
        "bitwise_or joins the yellow and green masks, and then the white one, so a pixel passes if it is any of the three colours. bitwise_and(frame, frame, mask=...) keeps only those pixels of the original frame and turns the rest black.",
        "Shows the result. d quits, and it is checked twice per pass (waitKey(33) and then waitKey(25)), so each pass takes about 58 ms. The camera is released and the windows closed at the end.",
      ],
      outs: [],
    },
  ],
  'computer-vision/object-detection': [
    {
      file: 'exam.py', title: 'Midterm: batch face detection', cutLines: [7, 15, 24, 34, 43],
      labels: ['Imports and the task', 'Paths and the output folder', 'Load the classifier once', 'The loop: build the path and read', 'Grey and detect', 'Draw, save and count'],
      note: 'Haar: find faces in 120 pictures.',
      does: [
        "Imports OpenCV and os. The note says the base folder is the original lab computer path, so replace it with your own folder that has the cascade file and a faces folder.",
        "The folder and file paths are built with os.path.join, and makedirs(exist_ok=True) creates the output folder if it is missing.",
        "The cascade is loaded once, outside the loop, because loading it again for every picture would waste time. If the file could not be loaded the script prints a message and exits. detected is the running total of faces.",
        "The loop goes through pictures 1 to 120. {i:03d} pads the number to three digits, so the files are img_001, img_010, img_100. imread gives None for a picture that cannot be read, which prints a warning and skips to the next one.",
        "The picture is converted from BGR to grey, and detectMultiScale runs with scaleFactor 1.1 and minNeighbors 5, the usual starting values.",
        "A green rectangle goes round every face, and pictures with at least one face are saved into the output folder. Pictures without a face print a message. The face count is added to the total, which is printed after the loop.",
      ],
      outs: [],
    },
  ],
  'computer-vision/haar-cascades': [
    {
      file: 'haar.py', title: 'Faces and eyes together', cutAt: /^#-{10,}/,
      labels: ['Paths', 'Face detection on a picture', 'Face detection on the webcam', 'Eye detection on a picture'],
      note: 'Haar: faces and eyes, photo and live.',
      does: [
        "Sets the paths of the two cascade files and the assets folder from the script's own location.",
        "Face detection on a picture. rescaleFrame shrinks it to half, the face cascade is loaded, the picture is made grey, and detectMultiScale uses a scale factor of 1.1 and 3 neighbours. Green rectangles mark the faces.",
        "Face detection on the webcam. The same cascade is run on every frame with its default settings, with a rectangle drawn round each face, until q is pressed.",
        "Eye detection on a picture. The eye cascade runs with scaleFactor 1.1 and a higher minNeighbors of 10, because eyes give more false hits than faces, and the boxes are drawn in red.",
      ],
      outs: [],
    },
    {
      file: 'hide_face.py', title: 'Hide the face', cutLines: [6, 10, 19, 25],
      labels: ['Imports', 'Load the face cascade', 'Read a frame and find faces', 'Build the mask and hide the faces', 'Show, quit and release'],
      note: 'Haar: black out the face.',
      does: [
        "Imports OpenCV, NumPy and os.",
        "The path to the cascade file is built from the folder of the script, so it works from any folder, and CascadeClassifier loads the trained face detector.",
        "Each frame is read, turned grey (cascades want a single channel), and passed to detectMultiScale with a scale factor of 1.3 and 5 neighbours, which gives a list of (x, y, w, h) boxes.",
        "mask starts as a black picture the size of the frame. For every face a filled white ellipse is drawn: its centre is the middle of the box and its half-axes are half the width and half the height. bitwise_not flips the mask, so bitwise_and keeps everything except the faces, and the faces turn black.",
        "Shows the result, quits on q, and releases the camera and windows.",
      ],
      outs: [],
    },
  ],
  'computer-vision/face-recognition': [
    {
      file: 'step1_capture.py', title: 'Step 1: capture faces', cutLines: [12, 22, 47],
      labels: ['Paths and settings', 'capture(): load the detector and open the camera', 'The capture loop', 'Ask for the user ID'],
      note: 'LBPH: capture the faces.',
      does: [
        "The paths of the cascade file and of the data folder, and SAMPLE_COUNT = 100, the number of pictures per person. makedirs creates the data folder if it does not exist.",
        "capture(user_id) loads the Haar cascade and checks it really loaded (empty() is True if the file is missing). It then opens the webcam and prints what it is about to do.",
        "The loop runs until 100 faces are saved. Each frame is turned grey and searched for faces. For each face, the crop gray[y:y+h, x:x+w] is saved as data/user.<id>.<count>.jpg, a green box and a 'Captured: n/100' label are drawn, and waitKey(100) leaves about a tenth of a second between pictures so the poses vary. q stops early, and the camera and windows are released at the end.",
        "The guard asks for a numeric ID. A value that is not a number prints a message, and otherwise capture() runs. The ID goes into every file name, which is how step 2 knows whose face it is.",
      ],
      outs: [],
    },
    {
      file: 'step2_train.py', title: 'Step 2: train the recognizer', cutLines: [12, 22, 51, 57],
      labels: ['Imports and paths', 'NAMES: id to name', 'Collect faces and ids', 'Train and save', 'Run it'],
      note: 'LBPH: train the recognizer.',
      does: [
        "Imports NumPy, PIL (to open the pictures as grey), os and OpenCV, and sets the paths of the cascade, the model file to be written and the data folder.",
        "A dictionary from user ID to name. The ID in a file name such as user.3.17.jpg is looked up here later. The real names were replaced with placeholders in this copy.",
        "Lists every picture in data/ and opens each as grey. The ID is read from the file name (split('.')[1]), and a file that does not follow the pattern is skipped. The Haar cascade then finds the face again in the picture, and each face crop is added to the list of faces with its ID. If no faces were found, it stops with a message.",
        "cv2.face.LBPHFaceRecognizer_create() makes the recognizer, train(faces, ids) learns from the crops, and write() saves the result as classifier.xml. It prints how many faces and which IDs were used. cv2.face needs the contrib build of OpenCV.",
        "The guard runs the training only when the file is run directly, and step 3 can still import NAMES from this file.",
      ],
      outs: [],
    },
    {
      file: 'step3_live.py', title: 'Step 3: recognise live', cutLines: [13, 19, 27],
      labels: ['Imports, paths and the threshold', 'Load the models and the camera', 'Read a frame and find faces', 'Name every face'],
      note: 'LBPH: name faces live.',
      does: [
        "Imports OpenCV, os, datetime and the NAMES dictionary from step 2. CONFIDENCE_THRESHOLD = 70 is the line between a known and an unknown face. For LBPH the number is a distance, so lower means a better match.",
        "Loads the Haar cascade, creates an empty LBPH recognizer, and read() loads classifier.xml into it.",
        "Opens the camera and starts the loop. Each frame is read and turned grey, and detectMultiScale finds the faces (scale factor 1.1, 5 neighbours).",
        "For each face, the grey crop goes to clf.predict(), which returns the ID of the closest learned face and a distance. If the distance is within the threshold the name is looked up in NAMES, otherwise it is 'unknown'. A green box and a label with the name, the ID and the distance are drawn, plus a title and a timestamp on the frame. q quits and the camera is released.",
      ],
      outs: [],
    },
  ],
  'computer-vision/trained-detection-yolo': [
    {
      file: 'train_yolo.py', title: 'Train a vehicle detector', cutLines: [4, 10],
      labels: ['The task', 'Imports and paths', 'Train the model'],
      note: 'YOLO: fine-tune on vehicles.',
      does: [
        "The note at the top says the vehicle dataset is not kept with the code because it is too large. Export it from Roboflow into a vehicles-openimages folder next to the script first.",
        "Imports os and YOLO from ultralytics. DATA_YAML is the path to the dataset's data.yaml, built from the script's own folder.",
        "Starts from the pretrained yolo11n.pt (the nano model) and fine-tunes it: 30 epochs, images resized to 640 pixels and a batch of 4. The guard runs the training only when the file is run directly. The best weights are saved to runs/detect/train/weights/best.pt.",
      ],
      outs: [],
    },
  ],
  'computer-vision/mediapipe': [
    {
      file: 'hands.py', title: 'Hand tracking, the Tasks API', cutLines: [18, 27, 34, 43, 56, 74, 100],
      labels: ['Imports', 'HAND_CONNECTIONS', 'The model file', 'ensure_model()', 'draw_hand_landmarks()', 'main(): the landmarker and the camera', 'main(): the loop', 'Run it'],
      note: 'MediaPipe: hand landmarks, current API.',
      does: [
        "Imports os, time, urllib, OpenCV and the MediaPipe Tasks modules. The docstring explains that newer MediaPipe removed mp.solutions, so the HandLandmarker from the Tasks API is used instead.",
        "A list of pairs of landmark numbers that are joined by a line: the four bones of the thumb, the four fingers, and three lines across the palm. The 21 landmarks start at 0, the wrist.",
        "MODEL_URL is where Google keeps the hand_landmarker.task model, and MODEL_PATH is where it is saved, next to the script.",
        "Downloads the model with urlretrieve if the file is not there yet, and returns its path.",
        "Each landmark's x and y are fractions from 0 to 1, so they are multiplied by the width and height to get pixels. It draws a green circle for every point, and then a blue line for every pair in HAND_CONNECTIONS.",
        "Makes sure the model exists, sets the options (VIDEO mode, two hands, 0.5 confidence for detecting, presence and tracking) and creates the landmarker. Then it opens the camera and raises an error if it cannot.",
        "Each frame is converted to RGB (OpenCV gives BGR) and wrapped in an mp.Image. VIDEO mode needs a timestamp in milliseconds that keeps growing, and detect_for_video returns the hands. Every hand found is drawn. q quits, and finally closes the landmarker, the camera and the windows.",
        "The guard runs main() only when the file is run directly.",
      ],
      outs: [],
    },
    {
      file: 'hand_servo.py', title: 'Colour under the finger to a servo', cutLines: [7, 13, 24, 29, 33, 43, 65, 108],
      labels: ['Imports', 'Settings', 'COLOR_TARGETS', 'Servo setup', 'set_servo_angle()', 'match_color()', 'MediaPipe and the camera', 'The main loop', 'Cleanup'],
      note: 'MediaPipe: colour to servo angle.',
      does: [
        "Imports OpenCV, MediaPipe, NumPy and the Pi's GPIO library, so this one only runs on a Raspberry Pi. The note at the top says it extends the colour-sampling example.",
        "OFFSET is how far from the fingertip the colour is sampled, so the finger itself does not cover the spot. MATCH_THRESHOLD is the largest RGB distance that counts as a match, and SERVO_PIN is GPIO18.",
        "The palette: eight colours, each with a reference RGB value and the servo angle it stands for. The angles follow a colour wheel from yellow at 180 degrees down to green at 22.5.",
        "Sets BCM numbering, makes GPIO18 an output and starts a 50 Hz PWM, the rate of a hobby servo.",
        "Turns an angle into a duty cycle: 2 + angle / 18, which gives 2% at 0 degrees and 12% at 180 degrees.",
        "Works out the straight-line distance from the sampled RGB to every palette colour, keeps the nearest, and returns its name and angle only if it is within the threshold. Otherwise it returns None for both.",
        "Gets MediaPipe's older hands solution and its drawing tools, opens the camera at 640 by 480, and sets up the tracker for two hands. Frame skipping runs MediaPipe on one frame out of three (SKIP_FACTOR = 2) and reuses the last result in between, which is much faster on a Pi. last_color remembers the colour that was last sent to the servo.",
        "Each frame is flipped like a mirror and sent to MediaPipe when it is its turn. For each hand, the landmarks are drawn and landmark 8, the index fingertip, is moved by OFFSET and clamped to the frame. The pixel colour there is read (row first), a green circle marks the spot and a swatch window shows the colour. match_color finds the nearest palette colour, and only when the colour has changed does it move the servo and print which colour it points at. q quits.",
        "Releases the camera, closes the windows, stops the servo and cleans up the GPIO pins.",
      ],
      outs: [],
    },
  ],
  'raspberry-pi-vision/python-and-arduino-compared': [
    {
      file: 'atm.py', title: 'Terminal ATM', cutLines: [5, 9, 14, 18, 26, 47],
      labels: ['The task', 'Account data', 'PIN check', 'The menu loop', 'Balance and deposit', 'Withdraw with banknotes', 'Exit and invalid choice'],
      note: 'Week 1: a terminal ATM, no hardware.',
      does: [
        "Week 1 is plain Python with no GPIO: a PIN login, a balance check, a deposit and a withdrawal that is broken down into banknotes.",
        "The starting balance, the correct PIN as text, and the banknote values from the biggest to the smallest in a list.",
        "Reads a PIN and compares it as text. A wrong PIN prints a message and exit() ends the program.",
        "A while True loop shows the menu again and again, and reads the choice as text.",
        "Choice 1 prints the balance. Choice 2 reads an amount with int(input()), adds it to the balance and prints the new one.",
        "Choice 3 first checks the balance is enough. It then goes through the notes from the biggest down: // counts how many of that note fit and % keeps what is left for the next. Anything left over at the end means the amount cannot be paid exactly, so nothing is taken from the balance.",
        "Choice 4 prints goodbye and leaves the loop with break, and anything else prints 'Invalid choice' and shows the menu again.",
      ],
      outs: [],
    },
    {
      file: 'blink.py', title: 'LED blink', cutLines: [6, 13, 23],
      labels: ['The task and the wiring', 'Setup', 'The blink loop', 'Cleanup'],
      note: 'Week 2: blink an LED on GPIO18.',
      does: [
        "The wiring: GPIO18 through a 220 ohm resistor to the LED anode, and the cathode to GND. The pin numbers are BCM numbers.",
        "Imports the GPIO library and time, selects BCM numbering and sets pin 18 as an output.",
        "The loop sets the pin HIGH for a second and LOW for a second, forever. Pressing Ctrl+C raises KeyboardInterrupt, which is caught so the program ends politely.",
        "finally always runs, even after Ctrl+C or a crash: GPIO.cleanup() hands every pin back so the LED does not stay in its last state.",
      ],
      outs: [],
    },
    {
      file: 'fade.py', title: 'PWM brightness fade', cutLines: [9, 19, 33],
      labels: ['The task and the wiring', 'Setup and PWM', 'The fade loop', 'Stop and cleanup'],
      note: 'Week 2: fade an LED with PWM on GPIO13.',
      does: [
        "The Pi has no analogWrite(), so the 0 to 255 brightness is mapped to a 0 to 100% PWM duty cycle. GPIO13 can do hardware PWM, and the LED sits on it through a 220 ohm resistor.",
        "GPIO.PWM(pin, 1000) makes a PWM signal at 1000 Hz, and start(0) starts it at 0% so the LED is off.",
        "The first for loop steps the brightness from 0 up to 255 in steps of 5, converts each value into a duty cycle with (brightness / 255) * 100, and sets it. The second loop does the same going down.",
        "Ctrl+C is caught, and finally stops the PWM before cleaning up the pins.",
      ],
      outs: [],
    },
    {
      file: 'buttons.py', title: 'Two buttons, one LED', cutLines: [9, 22, 35],
      labels: ['The task and the wiring', 'Setup', 'The main loop', 'Cleanup'],
      note: 'Week 3: two buttons, one LED.',
      does: [
        "Button 1 turns the LED on, and while it is held, button 2 can turn it off. Both buttons go between their pin and GND and use the internal pull-up, so a press reads LOW.",
        "The LED pin is an output and starts LOW. The two button pins are inputs with pull_up_down=GPIO.PUD_UP, so they read HIGH until pressed.",
        "Each pass reads both buttons. A LOW on button 1 switches the LED on, and the nested check turns it off again if button 2 is also pressed. time.sleep(0.2) after each action is a crude debounce.",
        "Ctrl+C is caught, and finally cleans up the pins.",
      ],
      outs: [],
    },
    {
      file: 'chaser.py', title: 'Five-LED chaser', cutLines: [11, 35, 46, 53, 64],
      labels: ['The task and the wiring', 'Setup and all_off()', 'Read the buttons', 'Step button', 'Auto button', 'Cleanup'],
      note: 'Week 3: a five-LED chaser.',
      does: [
        "A STEP button moves one lit LED along the row on each press, an AUTO button runs the whole chase by itself, and pressing both clears everything. The LEDs are on GPIO5, 6, 13, 19 and 26, and the buttons on 23 and 24 use the internal pull-up.",
        "Sets the five LED pins as outputs and LOW, and the two button pins as pull-up inputs. current_index remembers which LED is lit (-1 means none), and all_off() switches every LED off.",
        "Reads both buttons (LOW means pressed). If both are pressed it prints a message, clears the LEDs, resets the index and waits half a second.",
        "Only STEP pressed: all LEDs off, then the index goes up by one with % len(LED_PINS) so it wraps back to the first LED, and that LED is lit.",
        "Only AUTO pressed: it lights each LED in turn for 0.3 seconds, then clears everything. A 0.05 second pause at the end of the loop keeps the Pi from spinning too fast.",
        "Ctrl+C is caught and the pins are cleaned up.",
      ],
      outs: [],
    },
    {
      file: 'distance.py', title: 'Ultrasonic distance', cutLines: [10, 23, 38, 48],
      labels: ['The task and the wiring', 'Setup', 'Send the pulse and time the echo', 'Turn the time into a distance', 'Cleanup'],
      note: 'Week 4: print an ultrasonic distance.',
      does: [
        "The HC-SR04 takes 5V and GND, Trig goes to GPIO23 and Echo to GPIO24. The Echo pin gives 5V, so a voltage divider protects the Pi's 3.3V pins.",
        "Trig is an output and Echo is an input. Trig starts LOW and a half-second pause lets the sensor settle.",
        "A 10 microsecond HIGH pulse on Trig makes the sensor send a burst. The two while loops then time the Echo pin: the first waits for it to go HIGH and notes the time, the second waits for it to go LOW and notes that time. Arduino has pulseIn for this, but the Pi has to do it by hand.",
        "The pulse length is the time the sound took to go there and back. If it is too short it prints a sensor error. Otherwise distance = time * speed of sound / 2, where the speed of sound at 25 degrees is (331 + 0.6 * 25) m/s, converted to cm/s. // makes it a whole number.",
        "Ctrl+C is caught, and finally cleans up the pins.",
      ],
      outs: [],
    },
    {
      file: 'distance_leds.py', title: 'Ultrasonic LED patterns', cutLines: [9, 29, 39, 48, 60, 72, 81, 108],
      labels: ['The task and the wiring', 'Setup', 'all_off() and all_on()', 'Pattern: blink all', 'Pattern: outside in', 'Pattern: alternate', 'Pattern: turn off in a row', 'Measure the distance', 'Pick a pattern and clean up'],
      note: 'Week 4: distance picks an LED pattern.',
      does: [
        "The same sensor as w4a, but the distance now drives five LEDs in a different pattern for each distance band. Trig is GPIO23, Echo is GPIO24, and the LEDs are on GPIO5, 6, 13, 19 and 26.",
        "setwarnings(False) hides 'channel already in use' warnings. All LED pins and Trig are outputs, Echo is an input, and Trig starts LOW.",
        "Two small helpers switch every LED off or on with a loop over the pin list, so the patterns below do not repeat that code.",
        "5 to 20 cm: all five LEDs blink together five times, 0.15 seconds on and 0.15 off.",
        "21 to 50 cm: the two outer LEDs light, then the next pair, then the middle one. led_pins[-1 - i] counts from the end of the list, so it is the mirror of led_pins[i].",
        "51 to 100 cm: the LEDs at even positions and the LEDs at odd positions swap on and off three times. idx % 2 == 0 is True for every second LED.",
        "101 to 150 cm: everything lights, then the LEDs go off one by one.",
        "The same Trig and Echo timing as w4a. A timed-out pulse prints an error and turns everything off. Otherwise the distance is worked out and printed.",
        "An if / elif chain picks the pattern from the distance band and prints the action. Outside every band all LEDs go off. Ctrl+C is caught and finally cleans up the pins.",
      ],
      outs: [],
    },
    {
      file: 'motor_buttons.py', title: 'DC motor with buttons', cutLines: [12, 34, 52, 70],
      labels: ['The task and the wiring', 'Setup', 'Motor functions', 'The main loop', 'Cleanup'],
      note: 'Week 5: a motor on two buttons.',
      does: [
        "The L298N driver: ENA (speed) is on GPIO13, IN1 on GPIO18 and IN2 on GPIO12. The driver's GND is shared with the Pi, but the motor takes its power from its own supply, never from the Pi's 5V pin. Two buttons on GPIO19 and GPIO26 go to GND with the internal pull-up.",
        "Sets all three driver pins as outputs, the buttons as pull-up inputs, and starts a 1000 Hz PWM on ENA at 0%.",
        "Two pins that are HIGH and LOW decide the direction. motor_forward and motor_backward set IN1 and IN2 and the duty cycle (40% by default), and motor_stop makes both pins LOW and the duty 0.",
        "Each pass reads both buttons. While button 1 is held the motor goes forward, while button 2 is held it goes backward, and when neither is held it stops. sleep(0.05) keeps the loop from running flat out.",
        "On Ctrl+C or any exit, the PWM is stopped before GPIO.cleanup(), so the motor is not left running.",
      ],
      outs: [],
    },
    {
      file: 'motor_cmd.py', title: 'DC motor from the terminal', cutLines: [10, 31, 55, 63, 77, 92],
      labels: ['The task and the wiring', 'Setup', 'Motor functions', 'Status and input', 'Speed up and down', 'Direction and stop', 'Cleanup'],
      note: 'Week 5: a motor from the terminal.',
      does: [
        "The same wiring as w5a, but the motor is controlled by typed commands: F, B and S for forward, backward and stop, and + and - to change the speed by 10%.",
        "The pins and the PWM are set up as before. current_speed starts at 40 and current_direction at 'STOP'.",
        "Three functions set the direction pins and the duty cycle. Each also writes the new direction into the global current_direction, which is why they declare it with global.",
        "Each round prints the direction and speed, then input() reads a command. strip() removes stray spaces and upper() lets lower-case letters work too.",
        "+ raises the speed by 10 up to a maximum of 100 (min caps it), and - lowers it by 10 down to 0 (max stops it going below). If the motor is running, it is told the new speed at once.",
        "F, B and S call the matching function with the current speed. Any other text prints a message.",
        "On Ctrl+C the PWM is stopped and the pins are cleaned up.",
      ],
      outs: [],
    },
    {
      file: 'hand_servo.py', title: 'Hand tracking servo pointer', cutLines: [14, 28, 47, 63, 75, 79],
      labels: ['The task and the wiring', 'Imports and constants', 'Setup: servo, camera and model', 'Read a frame and find the hand', 'Fingertip to servo angle', 'Show and quit', 'Cleanup'],
      note: 'Week 6: a servo follows your finger.',
      does: [
        "MediaPipe tracks the index fingertip on the webcam, and its horizontal position becomes a servo angle from 0 to 180 degrees. The servo's signal goes to GPIO18, its power to 5V (use an external supply if it draws too much) and its ground to GND. hand_landmarker.task has to sit in the same folder.",
        "Imports OpenCV, MediaPipe, time and the GPIO library. SERVO_PIN is 18, MODEL_PATH is the model file and INDEX_FINGERTIP = 8 is the landmark number of the index fingertip. The next lines give short names to MediaPipe's classes.",
        "Sets up the servo: pin 18 as an output with a 50 Hz PWM, the rate every hobby servo expects, started at 0. Then the webcam and the hand landmarker options: video mode, one hand, and 0.5 confidence for finding and tracking.",
        "Each frame is read and flipped left to right like a mirror. MediaPipe wants RGB, so cvtColor converts it, and the frame becomes a mp.Image. detect_for_video also needs a timestamp in milliseconds, and the result holds the landmarks.",
        "If a hand was found, the fingertip's x and y (fractions from 0 to 1) are multiplied by the frame size to get pixels. The angle is the fingertip's position across the frame times 180, and duty = 2 + angle / 18 turns it into a PWM duty cycle from 2% to 12%. A green circle and the angle are drawn on the frame.",
        "Shows the frame in a window and stops when q is pressed.",
        "Always releases the camera, closes the windows, stops the servo and cleans up the pins.",
      ],
      outs: [],
    },
    {
      file: 'lcd.py', title: 'I2C LCD', cutLines: [19, 25, 32],
      labels: ['The task and the wiring', 'Import and setup', 'The counter loop', 'Cleanup'],
      note: 'Week 7: show a counter on a 16x2 LCD.',
      does: [
        "The LCD uses I2C on the Pi's fixed pins: SDA on GPIO2 (physical pin 3) and SCL on GPIO3 (pin 5), with VCC on 5V. Before it runs, enable I2C in raspi-config, reboot, run pip install rpi_lcd inside the venv, and check the address with sudo i2cdetect -y 1 (commonly 0x27).",
        "rpi_lcd gives an LCD class that uses the default address and bus. counter starts at 0.",
        "Every second it writes 'W7 LCD Test' on line 1 and 'Count: n' on line 2 (line numbers start at 1), then adds 1.",
        "Ctrl+C is caught, and finally clears the screen. There is no GPIO.cleanup() because no GPIO pin is used directly.",
      ],
      outs: [],
    },
    {
      file: 'lcd_yolo.py', title: 'YOLO detection on the LCD', cutLines: [17, 28, 39, 49, 61, 71, 75],
      labels: ['The task and the wiring', 'Imports and settings', 'Setup: model, LCD and camera', 'Read a frame and run YOLO', 'Draw the boxes', 'Update the LCD', 'Show and quit', 'Cleanup'],
      note: 'Week 7: YOLO names go on the LCD.',
      does: [
        "A webcam runs YOLO object detection and the LCD shows the names of what it sees. The LCD is wired as in w7a, a USB webcam shows up as /dev/video0, and it needs best.pt (the custom model) and a display for the cv.imshow window.",
        "Imports OpenCV, YOLO and the LCD class. The settings are the model file, a confidence of 0.5, a working size of 320 (small, so a Pi can keep up), a 320 by 240 camera frame and the 16 columns of the LCD.",
        "Loads the model, starts the LCD and clears it, and opens the camera at a small resolution. last_detected is a set of names that remembers what the LCD currently shows.",
        "Reads a frame and runs the model on it. results[0].boxes holds every detection of this frame. A frame that cannot be read ends the loop.",
        "For each box it looks up the class name, the confidence and the corner coordinates, adds the name to a set (so a name that appears twice is listed once), and draws a green rectangle and a label.",
        "The LCD is only rewritten when the set of names changes, which avoids flicker. Names are joined, sorted and cut to 16 characters. With nothing detected it shows 'Scanning...'.",
        "Shows the annotated frame and stops when q is pressed.",
        "Always releases the camera, closes the windows and clears the LCD.",
      ],
      outs: [],
    },
  ],
  'raspberry-pi-vision/problems-we-faced': [
    {
      file: 'colors.py', title: 'Colour calibration', cutLines: [17, 29, 55],
      labels: ['The colour list and the patch size', 'sample_center()', 'main(): ask for each colour', 'Run it'],
      note: 'Sample the RGB of eight paper squares.',
      does: [
        "The eight paper squares to calibrate, each with an angle (the position it will be at, from 22.5 to 180). PATCH = 30 is half the size of the square of pixels that is sampled.",
        "Reads five frames first and throws them away, because the camera buffer holds old frames. The sixth is the fresh one. It cuts out a 60 by 60 square around the centre of the frame, and np.mean over axes 0 and 1 averages every pixel of the patch into one B, G, R value. The result is returned as R, G, B whole numbers.",
        "Opens the camera at 640 by 480, then for each colour waits for you to hold that square in front of it and press Enter, samples the centre and prints the RGB. At the end it prints a ready-to-paste COLOR_TARGETS list with each colour name, its measured RGB and its angle.",
        "The usual guard: main() only runs when the file is run directly.",
      ],
      outs: [],
    },
    {
      file: 'train.py', title: 'Train YOLO for the Pi', cutLines: [9, 22],
      labels: ['Settings', 'main(): train', 'Report and run'],
      note: 'Fine-tune YOLO11 nano on the CPU.',
      does: [
        "The dataset file (data.yaml from the Roboflow export), 50 epochs, a 320 pixel image size and a batch of 4, all kept small so training fits on a small machine.",
        "Starts from the pretrained yolo11n.pt (the nano model) and trains it on the box dataset. device='cpu' means no GPU, workers=2 is the number of data loading threads, and name sets the run folder.",
        "Prints where the results and weights were saved. best.pt in that folder is the file the detection scripts load. The guard runs main() only when the file is run directly.",
      ],
      outs: [],
    },
    {
      file: 'export.py', title: 'Export a faster model', cutLines: [11, 23],
      labels: ['Settings', 'main(): export', 'Run it'],
      note: 'Export best.pt to NCNN and ONNX.',
      does: [
        "The weights to convert and the image size (320, the same as in training). NCNN is the fastest format on the Pi's ARM processor, and ONNX is a portable fallback if NCNN is not available.",
        "Loads best.pt and exports it once for each format. half=False keeps 32-bit numbers and simplify=True tidies the ONNX graph. A failed export prints the error and goes on with the next format.",
        "main() only runs when the file is run directly.",
      ],
      outs: [],
    },
    {
      file: 'train_pc.py', title: 'Train YOLO on a PC', cutLines: [4, 26],
      labels: ['Import', 'main(): train on a GPU', 'Run it'],
      note: 'The first full training run, on a GPU.',
      does: [
        "Imports YOLO from the ultralytics package.",
        "Loads the nano model and trains it on a box dataset with bigger settings than the Pi version: 100 epochs, 640 pixel images, a batch of 16, device 0 (the first GPU) and 8 workers. The path to data.yaml on the original Windows machine was replaced with a placeholder here. Training ends with the folder where the runs and weights were saved.",
        "The guard is needed on Windows for the multiprocessing that the data loader uses.",
      ],
      outs: [],
    },
    {
      file: 'live.py', title: 'Try the trained model live', cutLines: [5, 13, 27, 50],
      labels: ['Import', 'Load the trained model', 'Open the webcam', 'The detection loop', 'Release and run'],
      note: 'The trained box detector, live.',
      does: [
        "Imports OpenCV and YOLO.",
        "Loads the custom weights from a path (the original Windows path was replaced with a placeholder here) and prints which model is loading.",
        "Opens the webcam, checks it opened (otherwise it prints an error and returns), and asks for 1280 by 720 frames.",
        "Each pass reads a frame and runs model.predict with a confidence of 0.5, which drops weaker detections. r.plot() returns the frame with the boxes and labels drawn on it. The window shows it, and q or Esc (key code 27) stops the loop.",
        "Releases the camera and closes the windows. The guard runs main() only when the file is run directly.",
      ],
      outs: [],
    },
  ],
  'basic-python/lists': [
    {
      file: 'lists.py', title: 'Lists', cutAt: /^#\s*Exercise/i,
      note: 'Week 03: data types and lists.',
      does: [
        "Two lists, one with student numbers and one with names, where the same position in both lists is the same student. print(..., sep='\\t') puts a tab between the two items, so the numbers and names line up like a table. Each line takes one position from both lists. Indexing starts at 0, so index 0 is the first student and -1 is the last.\n\nThe last four prints show single names: the first, the last, the fifth and the fourth.",
        "A list can mix types: numbers and strings together. list1[0] reads the first item, which is 0.",
        "Lists can be changed. list2[3] = 'duck' replaces the fourth item ('dog') and the whole list is printed.",
        "len() counts the items in a list. list5 has 7 items.",
        "Starts from an empty list and fills it with append(). Each of the three input() answers is added to the end, then the list is printed.",
        "sort() puts the numbers in order inside the same list, so [0, 4, 2, 3, 1] becomes [0, 1, 2, 3, 4].",
        "A list of three model names grows by two with append(), using the names the user types.",
      ],
      outs: [],
    },
  ],
  'basic-python/conditionals': [
    {
      file: 'if_else.py', title: 'Conditionals', cutAt: /^#\s*Exercise/i,
      note: 'Week 04: if, elif and else.',
      does: [
        "int(input()) reads a whole number, and if / elif decides whether it is more than 0 or less than or equal to 0. Exactly one of the two messages prints.",
        "The area of a rectangle is width * length. The check `if width and length > 0` is a common slip: it means 'width is not zero, and length is above 0', so a negative width would still pass. Writing `width > 0 and length > 0` checks both.",
        "Converts Fahrenheit to Celsius with C = (F - 32) * 5 / 9, here written ((temp - 32) / 9) * 5, which gives the same answer. Below 32 degrees it only prints 'cool'.",
        "A grade ladder. round() makes the score a whole number, and then the first condition that is true wins: 80 and up is Grade 4, and 75, 70, 65, 60, 55 and 50 give 3.5, 3, 2.5, 2, 1.5 and 1. Below 50 it prints 0. The conditions run from the highest down, because once one matches the rest are skipped.",
        "A car park bill. A negative number asks for a positive one. More than 1 hour bills hr + 1 hours at 30 THB each: the `if min >= 0` test is always true here, so even exactly 2 hours 0 minutes is charged as 3, and the elif below it never runs. Up to 1 hour is free.",
        "A member discount. Only members are asked for their bill: 5000 or more gets 15% off, 1000 or more gets 10% off and 500 or more gets 5% off, where discount = bill / 100 * percent and new_bill = bill - discount. A non-member sees 'No discount'. A member with a bill under 500 gets no output at all, because there is no else for that case.",
        "Banknotes of 1000, 500 and 100. The amount must be a multiple of 100 (withdraw % 100 == 0). // counts how many whole notes fit, and % keeps what is left for the next smaller note.",
      ],
      outs: [],
    },
  ],
  'basic-python/loops': [
    {
      file: 'loops.py', title: 'Loops', cutAt: /^#\s*Exer/i,
      note: 'Week 05: while and for loops.',
      does: [
        "A while loop prints the odd numbers from 1 to 19 on one line. num starts at 1 and goes up by 2, and end=', ' keeps every number on the same line. At 19 it prints without a comma and uses break to leave the loop.",
        "A for loop over a list of seven numbers prints one per line.",
        "range(0, 19, 2) counts from 0 up to 18 in steps of 2: the even numbers.",
        "range(0, 101, 3) counts 0, 3, 6 up to 99. The if i % 3 == 0 check is always true here, because range already steps by 3.",
        "Prints a line of the letter i nine times long, then eight, down to one: x starts at 9 and goes down by 1 each round, and 'i' * x repeats the letter.",
        "A staircase of numbers. For each row i, the dashes fill 9 - i places and the inner loop prints the numbers 1 to i. The empty print() at the end starts the next row.",
        "Counts how often each letter appears in the text. The dictionary line holds the count of each letter, and line.get(ch, 0) + 1 starts at 0 for a new letter. Spaces are skipped with continue, and sorted(line) prints the letters in alphabetical order.",
        "Reads numbers until the user types q, and prints their average to two decimals, or 'No data' if there were none. The numbers are made into floats and collected in the list y, and n counts them. Typing something that is not a number, such as a word, makes float() stop with an error.",
        "A hollow triangle of the height you type. The first row is a single star, the last row is a full line of 2 * h - 1 stars, and every row in between is a star, some spaces and another star. extspace pushes each row to the right place.",
        "Reads five items and sorts them, then prints the middle one. The inputs are text, so sort() orders them as text, which means '10' comes before '9'. Use int() on each input if you want number order.",
        "Draws an X pattern. For each row in the top half, a list of dashes gets an X at position i and another at the mirror position size - 1 - i, and join() turns the list into a line. The second loop counts back down to draw the bottom half. The odd and even sizes are handled separately so the middle row is not drawn twice.",
      ],
      outs: [],
    },
  ],
  'basic-python/functions': [
    {
      file: 'functions.py', title: 'Functions', cutAt: /^#\s*Exercise/i,
      note: 'Week 06: def, parameters and return.',
      does: [
        "print_name takes three parameters (real name, surname and age) and prints a greeting. The main code reads the three values and calls the function with them.",
        "bmi_calculator turns the height from centimetres into metres, then BMI = weight / height squared, and prints it with 2 decimals. It prints inside the function, so it gives nothing back to the caller.",
        "A four-function calculator. Each branch does `return print(...)`, but print() itself returns None, so the function prints the answer and then hands back None. A function that returns the number itself (return n1 + n2) could be used in more maths.",
        "find_max_min takes a list, makes a sorted copy and shows the first item (the lowest) and the last item (the highest). The loop below collects numbers until the user types q.",
      ],
      outs: [],
    },
  ],
  'basic-python/tuples-and-dicts': [
    {
      file: 'dicts.py', title: 'Tuples and dictionaries', cutAt: /^#\s*Exercise/i,
      note: 'Week 07: tuples and dictionaries.',
      does: [
        "Reads a Thai number out loud. thainum holds the Thai digits, thairead the words for each digit and digit_suffix the place names (units, tens, hundreds, thousands), all as tuples because they never change. The loop goes through each digit with enumerate: it builds the number in Thai digits and the spoken form.\n\nThe special cases follow the Thai rules: a 0 is skipped, a 1 in the tens place is just 'สิบ' (ten), a 1 at the end after another digit is 'เอ็ด', and a 2 in the tens place is 'ยี่'. The three replace lines at the end of each round tidy up combinations such as 'หนึ่งสิบ' into 'สิบ'.",
        "The twelve zodiac names and the twelve animals sit in two tuples. (year + 5) % 12 turns a year in the Thai calendar into a position in the cycle, and the same position in both tuples gives the name and the animal for the years 2565 to 2570.",
        "A dictionary maps short English day names to Thai day names. keys() and values() print all the keys and all the values.",
        "A menu dictionary with prices. The user picks a dish, and menu.get(choice) returns its price, or None if the dish is not on the menu, without crashing.",
      ],
      outs: [],
    },
  ],
  'basic-python/oop': [
    {
      file: 'oop.py', title: 'Classes and objects', cutLines: [18, 22, 39, 68, 95, 122, 147, 176],
      labels: ['Employee', 'animal', 'fighterjet', 'Businessman', 'Encapsulation: a bank account', 'Inheritance: pet, dog, cat', 'Class attributes and class methods', '@property: a checked attribute', 'Objects that hold objects'],
      note: 'Week 08: classes, inheritance and more.',
      does: [
        "A class with two __init__ methods. Python keeps only the last definition, so the first (the 'default constructor') is replaced and Employee() with no arguments would fail. The one that stays takes a name and a salary and stores them with self. edit_salary changes both values and showdata prints them. emp1 is an object built from the class, and the calls show the salary before and after the edit.",
        "A very small class with one method that prints a name. It is never used in this file.",
        "detail() sets the attributes of a fighter jet. The line `self.name = \"F22\" and \"Raptor\"` does not join two strings: `and` gives back the last value when both are true, so the name is just 'Raptor' (and the missile is just 'AIM-9'). The attributes are made inside detail() instead of in __init__, so they only exist after detail() has been called. The prints all start with the word Aircraft. Raptor = fighterjet() makes the object and Raptor.detail(1) fills it.",
        "The class from the chapter: three stats (HP, money and happiness) and methods that change them: work lowers HP and happiness and raises money, sleep raises HP and happiness and lowers money, play lowers HP and money and raises happiness. showdata prints the three numbers, and the calls below print the state after each action.",
        "Encapsulation means keeping a value behind methods so it cannot be put in a bad state. _balance starts with an underscore, a promise that other code should not touch it directly. deposit refuses zero or negative amounts by raising a ValueError, and withdraw prints a message and returns early if the money is not there. __str__ is the special method print() calls, so print(acc) shows the owner and the balance. Here 100 + 50 = 150, the 500 withdrawal is refused, 30 comes out and 120 is left.",
        "Inheritance lets a class reuse another one: Dog(Pet) is a Pet, so it already has name and intro(). Dog only replaces speak(), which is called overriding. Cat has its own __init__, and super().__init__(name) hands the name to Pet's __init__ so it is not copied by hand. In the loop each object gets the same intro() call but runs its own speak(), and that is polymorphism: one call, a different behaviour for each class.",
        "A class attribute (pi, count) lives on the class and is shared by every object, while self.r belongs to one circle. Circle.count counts how many circles were built. @classmethod receives the class itself as cls, so Circle.unit() can build a circle of radius 1 without an object. @staticmethod receives neither self nor cls and is just a function that lives in the class for tidiness. The circle areas are 3.14159 * 2 ** 2 = 12.57 and 3.14.",
        "@property makes a method read like an attribute. celsius has a getter, and the @celsius.setter runs on every assignment, including the one inside __init__, so a bad value is caught from the start. fahrenheit has no setter, so it is read-only and is worked out each time it is asked for, which means it can never disagree with celsius. 25 C is 77 F, 100 C is 212 F, and -300 C raises the ValueError that the try/except catches.",
        "Objects can hold other objects. A Shelf keeps a list of Book objects, add() returns self so calls can be chained, and total_pages() adds up the pages with a generator. __len__ lets len(shelf) work, and __repr__ controls how a Book is written when it sits inside a list. This is composition: a Shelf has books, unlike a Dog, which is a Pet.",
      ],
      outs: [null, null, null, null, "Not enough money\nAnn: 120 baht", "Thing says ...\nRex says Woof\nMimi says Meow", "12.57 3.14 2 False", "77.0\n212.0\nError: below absolute zero", "2 420 [Book('Python 101', 300), Book('Robots', 120)]"],
    },
  ],
  'basic-python/os-files-and-folders': [
    {
      file: 'os_demo.py', title: "os: three examples", cutAt: /^#\s*=====/,
      note: "Three os examples on a fake dataset.",
      does: [
        "Builds a small fake dataset so the examples have something real to work on. The dictionary maps a class name to its file names, and for each class os.makedirs creates demo_data/<class> (exist_ok=True means no error if it is already there). open(..., 'w') writes some text into every file so each one has a size. Notice that cat02.JPG has a capital extension and that notes.txt is not a picture, because both matter later. Every path is built with os.path.join, so the code works on Windows and on the Pi.",
        "Looking around and asking questions. os.getcwd() is the folder the script runs from, and the first two lines check that it is an absolute path and that '.' means the same place. The loop lists the dataset root: os.listdir gives names in no promised order, so sorted() keeps the output stable, and os.path.isdir tells a folder from a file.\n\nThen one path is taken apart. os.path.exists and isfile check it, basename gives the file name, dirname gives the folder part, splitext splits off the extension and getsize gives the size in bytes. The output of dirname and splitext has backslashes because it was run on Windows, and on a Pi or a Mac it shows forward slashes.",
        "Counting the pictures in each class, the first step of reading a dataset. The loop skips anything that is not a folder, then keeps only the names that end in .jpg, .jpeg or .png. lower() lets cat02.JPG count too, and endswith accepts a tuple of endings. notes.txt is left out, so cats has 3 pictures and not 4.\n\nThe counts go in a dictionary, and the table prints each count and its share of the total. At the end os.walk visits every folder at any depth, and counting the pictures that way gives the same total, which shows the two approaches agree.",
        "Rename, copy and clean up. A train folder is made first. For each class the files are renamed to a numbered pattern, cat_001.jpg, cat_002.jpg and so on: splitext keeps each file's extension in lower case and the format {number:03d} pads the number to three digits. os.rename moves a file to its new name and shutil.copy puts a copy in the train folder, because the os module has no copy call.\n\nThe last part is the clean-up. shutil.rmtree deletes a folder and everything in it for good, so the code first checks that the folder exists and that its name really is demo_data. A check like that before any delete is worth copying into your own code.",
      ],
      outs: ["made: ['cats', 'dogs']", "the working folder is an absolute path: True\n'.' means here: True\ncats   is a folder with 4 items\ndogs   is a folder with 3 items\nexists: True | is a file: True\nbasename: cat02.JPG\ndirname : demo_data\\cats\nsplit   : ('demo_data\\\\cats\\\\cat02', '.JPG')\nsize    : 520 bytes", "label  pictures  share\ncats          3  50%\ndogs          3  50%\ntotal  6\nos.walk agrees: True", "train folder: ['cat_001.jpg', 'cat_002.jpg', 'cat_003.png', 'dog_001.jpg', 'dog_002.png', 'dog_003.jpeg']\ncleaned up: True"],
    },
  ],
  'basic-python/sys-arguments': [
    {
      file: 'sys_demo.py', title: "sys: three examples", cutAt: /^#\s*=====/,
      note: "Three sys examples: args, env, options.",
      does: [
        "argparse and sys both come with Python. sys is the window into the interpreter: the command-line words (sys.argv), exit codes, the Python version, and the standard output and error streams. argparse builds a command-line parser for options that have names.",
        "A small command-line tool written as a function. A real script would end with sys.exit(calculator(sys.argv[1:])), where sys.argv[1:] is every word after the script name. Here the function takes the list as a parameter so it can be tried with made-up lists, and the loop at the bottom tries six of them.\n\nThe function checks things in order. First the number of words: a usage message and exit code 1 if it is wrong. Then whether the two numbers really are numbers: every word in sys.argv is text, so float() can fail, and try/except ValueError returns code 2. Then the operation: dividing by zero gives code 3 and an unknown operation gives code 4. Returning a different code for each problem lets the terminal or another program know exactly what went wrong, and 0 always means success.",
        "Which Python is this? sys.version_info and sys.platform give the version and the system, and sys.executable is the full path of the running interpreter (only the file name is printed here). sys.prefix differs from sys.base_prefix inside a virtual environment, so comparing them tells you whether a venv is active. This is the quick check for 'No module named ...' errors, which usually mean you ran a different Python from the one you installed into.\n\nsys.path is the list of folders searched when you import something, and sys.modules is the dictionary of modules already imported, so a name inside it was loaded already. The output shown comes from one Windows machine, so yours will differ.",
        "Options with names. For anything beyond a couple of values, argparse is neater than reading sys.argv by hand. add_argument('path') is a required value, --epochs and --lr are optional and have a type (so they come back as an int and a float and not as text) and a default, and --verbose with action='store_true' is a flag that is True only when it is present. parse_args normally reads sys.argv, but here it is given a list, so you can see what each command line would produce. The second call shows the defaults.\n\nThe last two lines show the two output streams. print writes normal results to stdout, and file=sys.stderr sends warnings to a separate stream, which a terminal can redirect on its own (python x.py > log.txt writes the results to the file and keeps the warnings on screen). Here both appear together because the output was captured as one.",
      ],
      outs: [null, "add 3 4 = 7\n  exit code 0\n\nmul 2.5 4 = 10\n  exit code 0\n\nCannot divide by zero\n  exit code 3\n\nUsage: python calc.py OPERATION NUMBER NUMBER   (add, sub, mul or div)\n  exit code 1\n\nUnknown operation: pow\n  exit code 4\n\nNot a number: 'x' or '1'\n  exit code 2", "python version : 3.11.9\nplatform       : win32\ninterpreter    : python.exe\ninside a venv  : False\nimport search  : 7 folders, the first one is the script's own folder\n  json             imported already\n  numpy            not imported yet\n  no_such_library  not imported yet", "path   : data.csv\nepochs : 20 int\nlr     : 0.01 float\nverbose: True\ndefaults: 5 0.1 False\ntraining finished\nwarning: the learning rate is high"],
    },
  ],
  'basic-python/numpy-arrays': [
    {
      file: 'numpy_demo.py', title: "NumPy: three examples", cutAt: /^#\s*=====/,
      note: "Three NumPy examples, data to neuron.",
      does: [
        "NumPy is imported as np, a short name everyone uses. It is installed once with pip install numpy.",
        "A grid of numbers and the questions you ask of it. sales is 4 days by 3 shops, so its shape is (4, 3) and it holds 12 items (the type is int32 because this was run on Windows). sum() adds everything, sum(axis=0) squashes the rows into one total per shop, and sum(axis=1) squashes the columns into one total per day. argmax gives the position of the biggest value, so the biggest mean shows the best shop.\n\nThe centering line is broadcasting: a row of 3 averages is stretched down the 4 rows, so every shop has its own average removed in one line, and the check afterwards shows each average is now 0. Last, a comparison makes a mask of True and False, and the mask picks the rows of one column (np.where gives the day numbers).",
        "A picture is an array. A 6 by 6 grey picture starts as all zeros (black) of type uint8, the usual type for pixels. Slicing sets a block, so img[2:4, 2:4] = 200 is the square on rows 2 and 3, columns 2 and 3, and the last column gets a gradient from linspace. crop = img[1:5, 1:5] is how OpenCV crops: y first, then x. [::-1] reads a row or a column backwards, which flips the picture.\n\nuint8 stops at 255 and wraps around, so 200 + 100 gives 44. To brighten a picture you change to a bigger type first and use np.clip(..., 0, 255). A colour picture has a third axis for the channels: shape (2, 3, 3) is 2 rows, 3 columns and 3 colour numbers each. rgb[:, :, 0] picks the first channel, and mean(axis=2) averages the channels into a grey value.",
        "The maths behind a neural network, in a few lines. A neuron is a weighted sum plus a bias: np.dot(x, w) + b is 1 * 0.5 + 2 * (-1) + 3 * 2 + 0.5 = 5, and sigmoid squashes that into 0 to 1 (about 0.993).\n\nA layer does the same for many neurons and many examples at once. X holds 4 examples with 3 inputs, W holds the weights of 3 neurons, and X @ W + B is a matrix multiplication that gives a 4 by 3 table of scores in one line. softmax turns each row of scores into probabilities that add up to 1 (subtracting the row maximum first stops exp() overflowing), argmax(axis=1) picks the most likely class for each example, and names[best] turns the numbers into words. The weights are random (the seed makes them the same on every run), so the predictions are only an illustration. The last line counts the examples where the model is more than 60% sure.",
      ],
      outs: [null, "shape: (4, 3) | items: 12 | type: int32\ntotal of everything : 266\nper shop (axis=0)   : [ 50 124  92]\nper day  (axis=1)   : [63 68 63 72]\nbest shop on average: 1 (index of the biggest mean)\naverage of each shop after centering: [0. 0. 0.]\ndays above 30 in shop 1: [2 3] -> [35 31]", "[[  0   0   0   0   0   0]\n [  0   0   0   0   0  51]\n [  0   0 200 200   0 102]\n [  0   0 200 200   0 153]\n [  0   0   0   0   0 204]\n [  0   0   0   0   0 255]]\ncrop shape: (4, 4)\nrow 2        : [  0   0 200 200   0 102]\nrow 2 flipped: [102   0 200 200   0   0]\nlast column flipped: [255 204 153 102  51   0]\nwrapped : 44 | clipped: 255\ncolour shape: (2, 3, 3) | red channel:\n [[255   0   0]\n [  0   0   0]]\ngrey version: [[85, 0, 0], [0, 0, 85]]", "z = 5.0 | sigmoid(z) = 0.9933\nscores shape: (4, 3)\nprobabilities of example 0: [0.272 0.519 0.209] | sum: 1.0\npredictions: ['dog', 'dog', 'dog', 'cat']\nconfidence : [0.52, 0.45, 0.55, 0.8]\nconfident (> 0.6): 1 of 4"],
    },
  ],
  'basic-python/matplotlib-plots': [
    {
      file: 'plot_demo.py', title: "Matplotlib: three examples", cutAt: /^#\s*=====/,
      note: "Three Matplotlib charts saved to files.",
      does: [
        "matplotlib.use('Agg') has to come before pyplot is imported. It draws into files, so the script works with no screen, over SSH, on a Raspberry Pi or on a server. An output folder is made for the pictures.",
        "A line chart with two lines and a legend, the standard training-curve picture. The data is made with NumPy: the training loss falls steadily, and the validation loss follows it until epoch 8 and then climbs again, which is the shape of overfitting. val_loss.argmin() gives the epoch with the lowest validation loss.\n\nplt.plot draws a line with a colour, a marker and a label, axvline adds a dashed vertical line at the best epoch, and legend() draws the key from the labels. title, xlabel and ylabel make it readable, tight_layout stops labels being cut off, savefig writes a PNG, and close() frees the figure so the next chart starts clean. The numbers printed give the best epoch and show that the validation loss at the end is worse than at its best.",
        "Two charts in one picture. plt.subplots(1, 2) returns the figure and two axes, left and right, and each chart is drawn on its own axis, which is why the calls are set_title and set_xlabel and not title and xlabel.\n\nOn the left is a bar chart of accuracy by model. The best bar is green and the rest are grey, bar_label writes the value on top of each bar, and set_ylim(0.5, 1.0) zooms the y axis in. A cut-off axis exaggerates differences, so say so whenever you do it. On the right is a scatter plot of two classes of random points, one colour each, with a legend.",
        "A histogram and a confusion matrix. hist shows how the scores are spread. The data was made from two bumps, so the histogram has two peaks, and hist also returns the counts and the edges, which is how the tallest bin can be printed.\n\nimshow draws an array as coloured squares. A confusion matrix has the true class down the side and the predicted class across, so the diagonal holds the correct answers. set_xticks and set_yticks label the axes with the class names, a double loop writes each number into its square (white text on dark squares and black on light ones, so it stays readable), and colorbar adds the colour key. The accuracy is the sum of the diagonal over the sum of everything, np.trace(matrix) / matrix.sum(), which is 0.887 here.",
      ],
      outs: [null, "best epoch: 12 | validation loss there: 0.089\nvalidation is worse than the best by the end: True", "best model: forest with 0.91", "tallest bin holds 40 of 400 scores\naccuracy from the matrix: 0.887\nfiles: ['bars_and_scatter.png', 'histogram_and_matrix.png', 'loss_curves.png']"],
    },
  ],
  'basic-python/pandas-tables': [
    {
      file: 'pandas_demo.py', title: "Pandas: three examples", cutAt: /^#\s*=====/,
      note: "Three Pandas examples: clean to model.",
      does: [
        "pandas is imported as pd. It is built on NumPy, so numpy is imported too, here for nan (a missing value) and np.select.",
        "Building, inspecting and cleaning a table. pd.DataFrame turns a dictionary into a table, where each key is a column. shape, info() and describe() answer 'what did I just load?': the size, each column's type and how many values are not missing, then the count, mean, spread and quartiles of the number columns. isna().sum() counts the gaps (one score is missing) and duplicated().sum() counts repeated rows (Ben appears twice).\n\nThe cleaning: drop_duplicates removes the repeat, and fillna fills the missing score with the column average, which is 78.4 for Cara. np.select turns the score into a grade, where the first condition that is true wins and default covers the rest. sort_values orders the table with the highest score first.",
        "Questions you ask of a table. A new column, income, is units times price, and the maths runs down the whole column at once. Filtering uses a condition that gives a column of True and False. Each condition needs its own brackets and & means 'and', because the words and / or do not work here. isin keeps the rows whose value is in a list.\n\ngroupby splits the table into groups, calculates for each group and joins the answers: the total income per shop, and then agg with three named results per item (the sum, the maximum and the row count). value_counts counts the rows of each value, and idxmax gives the label of the biggest value, which is the best shop.",
        "Getting a table ready for a model. The features go in X and the answers in y. get_dummies turns the text column city into 0/1 columns, one per city, because models need numbers. The two number columns are scaled with (value - mean) / std, so each has a mean of 0 and a spread of 1, and neither one dominates just because its numbers are bigger.\n\ndata.sample(frac=0.25, random_state=0) picks 25% of the rows for testing, the same ones every run, and drop and loc split X and y into a train part and a test part by those row labels. to_numpy() turns a table into the plain array that many libraries want. The last lines save the training table with to_csv and read it back with read_csv, which shows the shape is unchanged.",
      ],
      outs: [null, "(7, 4)\n<class 'pandas.core.frame.DataFrame'>\nRangeIndex: 7 entries, 0 to 6\nData columns (total 4 columns):\n #   Column  Non-Null Count  Dtype  \n---  ------  --------------  -----  \n 0   name    7 non-null      object \n 1   class   7 non-null      object \n 2   score   6 non-null      float64\n 3   hours   7 non-null      int64  \ndtypes: float64(1), int64(1), object(2)\nmemory usage: 356.0+ bytes\n       score  hours\ncount    6.0    7.0\nmean    77.7    4.1\nstd      8.0    2.0\nmin     68.0    2.0\n25%     74.0    3.0\n50%     75.5    4.0\n75%     80.8    4.5\nmax     91.0    8.0\nmissing per column:\n name     0\nclass    0\nscore    1\nhours    0\ndtype: int64\nduplicate rows: 1\n   name class  score  hours grade\n3   Dev     C   91.0      8     A\n0   Ann     A   82.0      5     B\n2  Cara     A   78.4      4     B\n5   Fay     A   77.0      4     B\n1   Ben     B   74.0      3     B\n4   Eli     B   68.0      2     C", "tea sold over 25 units:\n    shop item  units  price  income\n0  north  tea     30     40    1200\n7  south  tea     31     40    1240\nnorth or east: 5 rows\nshop\neast     2920\nnorth    4675\nsouth    4925\nName: income, dtype: int64\n        units  best_day  rows\nitem                         \ncoffee    136        51     3\ntea       126        31     5\nitem\ntea       5\ncoffee    3\nName: count, dtype: int64\nbest shop: south", "   height  weight  city_bkk  city_cnx  city_hkt\n0   -1.44   -1.17         1         0         0\n1   -0.68   -0.66         0         1         0\n2    0.24    0.11         1         0         0\ntrain: 6 rows | test: 2 rows | test rows: [2, 6]\nas an array: (6, 5) float64\n(6, 6) read back from train.csv"],
    },
  ],
  'basic-python/tkinter-gui': [
    {
      file: 'gui.py', title: 'Tkinter tutorial', cutAt: /^#\s*=====/,
      note: 'Week 09: nine windows, one idea each.',
      labels: ['Imports', '1. A window', '2. Labels', '3. A button', '4. An entry', '5. Layout', '6. Choices', '7. A list and a slider', '8. A canvas', '9. Menu and clock'],
      does: [
        "tkinter comes with Python, so nothing needs installing. It is imported as tk, and messagebox is brought in separately for the pop-up in step 9. Each step below builds one window, so close a window to open the next one.",
        "tk.Tk() makes the main window. title() names it, geometry('320x160+200+200') sets width x height + x + y, and configure(bg=...) sets the colour. mainloop() starts the loop that listens for clicks and keystrokes, and the window stays open until it is closed, so it always goes last.",
        "A Label is text for reading. The first argument is the parent window, then options: text, font as (name, size), fg for the text colour and bg for the background. pack() puts the widget into the window, one under the other. fill='x' stretches it across the width and pady adds space above and below.",
        "A Button runs a function when it is clicked: command=add_one, with no brackets, because brackets would call it right away instead of on the click. Inside the function, label.config(text=...) changes a widget that already exists. global count is needed because the function assigns to a variable that lives outside it.",
        "An Entry is a one-line text box. entry.get() reads what is typed at that moment, so it is called inside the button's function rather than at the top. strip() removes spaces from both ends, and an empty name gets a hint instead of 'Hello, !'.",
        "Two ways to place widgets. pack() stacks them. grid() puts them in a table of rows and columns: sticky='e' pushes a widget to the east (right) edge of its cell, and columnspan=2 lets the Save button stretch across both columns. A Frame is an invisible box that groups widgets, and the top frame uses pack while the form frame uses grid. Do not mix pack and grid inside the same parent, because tkinter will wait forever. place(x=, y=) is the third way, for exact pixels.",
        "A Checkbutton keeps True or False and a Radiobutton group keeps one choice. Tkinter has its own variable types for this: BooleanVar and StringVar. The widget writes into them and you read them with .get(). All three radio buttons share one variable, which is why only one can be on at a time, and each has its own value. show() is called at the start too, so the label is not empty at first.",
        "A Listbox shows several lines, and the selected one is read with curselection(), which is a tuple of positions and is empty when nothing is selected. bind('<<ListboxSelect>>', picked) runs picked whenever the selection changes. Events pass an event object to the function, so picked takes one argument even though it does not use it. A Scale is a slider whose value is slider.get().",
        "A Canvas is a drawing area with its own coordinate system, where (0, 0) is the top-left corner and y grows downwards. create_rectangle and create_oval take the corners (x1, y1, x2, y2), and create_text takes a centre point. bind('<Button-1>', dot) calls dot on a left click, and event.x and event.y are where the mouse was, so every click draws a small dot there.",
        "root.after(1000, tick) asks tkinter to call tick again in one second, which makes a clock without freezing the window. Never use time.sleep() in a window, because the loop would stop answering the mouse. A Menu is built from a bar, a menu with add_command items and add_cascade to attach it, then root.config(menu=menubar) installs it. messagebox.showinfo opens a standard pop-up, and root.destroy closes the whole window.",
      ],
      outs: [],
    },
  ],
  'basic-python/printing-and-getting-input': [
    {
      file: 'print.py', title: 'Print', cutAt: /^#\s*Q\d+/i,
      note: 'Week 01: strings and the print command.',
      does: [
        'Two variables, then one print with five %d blanks. The values in the brackets fill the blanks in order: a, b, b, a and a+b. The output reads 2 + 3 = 3 + 2 = 5, so the same pair added in either order gives the same sum.',
        'Three variables fill seven %d blanks. One variable can fill more than one blank, so a is used three times and b and c twice. The print shows the distributive law as written text, 2*(3+5) = 2*3+2*5. It prints the pieces, not the answer.',
        '%.2f fills the blank with a decimal rounded to two places. The values are b, a and b-a, so it prints 2.50 - 2.40 = 0.10. Plain %f would show six decimal places.',
        'Strings can hold Thai text. %d drops the whole number 25 into the sentence.',
        'A lone % starts a code, so a plain percent sign is awkward to type inside the text. Here the % is saved in a variable and filled in with %s, which fills a blank with text.',
        'All three codes in one line: %d for the whole number 2, %.2f for the decimal 3.5 (shown as 3.50), and %s for the percent sign, used twice.',
      ],
      outs: [null, '2 + 3 = 3 + 2 = 5', '2*(3+5) = 2*3+2*5', '2.50 - 2.40 = 0.10', 'ฉันเกิดวันที่ 25 ธันวาคม', 'ฉันได้กำไร 5%', 'เมื่อวานฉันขาดทุน 2% วันนี้ฉันได้กำไร 3.50%'],
    },
    {
      file: 'input.py', title: 'Input', cutAt: /^#\s*Exercise\s*[\d-]+/i,
      note: 'Week 02: the input command.',
      does: [
        'input() shows the question and waits for you to type. Whatever you type comes back as text, so type(a) says str even if you typed a number. The f-string prints the value and its type.',
        'Asks for a name and prints it with the type of what you entered. The \\n inside the text starts a new line.',
        'Two numbers read with float(), so the maths works. It adds, subtracts, multiplies and divides, and prints each answer with its type. Every answer is a float, because dividing with / always gives a float.',
        'A decimal and a whole number together. The answer is a float, because Python turns the whole number into a decimal before it adds or subtracts.',
        'A physics formula as a program: work = force x distance, and power = work / time. It asks for the force in newtons, the distance in metres and the time, and prints the answers in joules and watts.',
        'Several inputs used in one sentence. The two ages are read with int() so they can be subtracted to give the age gap. The first name and surname stay as text.',
        'Comparing two numbers with > gives True or False. That value is a bool, and type() confirms it.',
        'The first import of the course. import math gives you math.pi, and the cone\'s volume is one third times pi times the radius squared times the height. ** means to the power of.',
      ],
      outs: [],
    },
  ],
  'ai-development/mlp': [
    {
      file: 'MLP_train_week2.py', title: 'MLP from scratch', cutAt: /^\s*#\s*===== /,
      note: 'NumPy MLP from scratch on MNIST.',
      does: [
        'Loads train.csv with pandas, splits off the label column as y and scales the 784 pixel columns to x by dividing by 255 (0-1 range). train_test_split holds out 10% as a validation set, stratified so every digit keeps its share, so there is data the model never trains on to check it honestly. The commented block below would preview one digit as an image with imshow if uncommented.',
        "relu(z) passes positive scores through and blocks the rest, the kink that lets stacked layers learn curves instead of one straight line; deriv_relu is relu's slope, used later to push error backward through it. softmax turns the last layer's raw scores into 10 probabilities that sum to 1.",
        "What it converts: a label like Y=3 (just one number) into a 10-row column of 0s with a single 1 at row 3, e.g. [0,0,0,1,0,0,0,0,0,0]. Why: softmax's output A2 is 10 numbers, one probability per digit, so the true label has to be reshaped into that same 10-number form before the two can be compared or subtracted.\n\nHow: oh = np.zeros((10, m)) makes an all-zero 10-row, m-column grid (m = batch size, one column per example); oh[Y, np.arange(m)] = 1 then drops a 1 into row Y[i] of column i for every example i at once, no loop needed. The result is exactly what back_prop's dZ2 = A2 - one_hot(Y) subtracts: predicted probabilities minus what should have been predicted.",
        "get_predict reads off the highest-probability class, get_accuracy compares that to the true labels. init_params and NeuralNet.__init__ fill W1, b1, W2, b2 with small random numbers: W is a per-input volume knob, b is a per-neuron trigger offset, both reshaped as training runs.",
        'One image goes through both layers: Z1 is the hidden layer\'s weighted sum (W1·X+b1), A1 = relu(Z1) is what actually fires, Z2 is the output layer\'s weighted sum, A2 = softmax(Z2) is the final probability per digit. This is the guess pass, nothing is adjusted yet.',
        "Walks the forward pass backward with the chain rule to find which way is downhill for every weight and bias. dZ2 is the output error (predicted minus true, from one_hot). dW2/db2 are its slope on W2/b2. dZ1 pushes that error back through relu's derivative to the hidden layer, giving dW1/db1. Nothing is updated here yet, just measured. (\"This chapter is more mathematically involved than the rest of the book. If you're not crazy about mathematics you may be tempted to skip the chapter, and to treat backpropagation as a black box whose details you're willing to ignore. Why take the time to study those details?\" (someone who clearly had to write this cell too).)",
        'The actual learning step: every weight and bias moves a small distance (alpha, the learning rate / LR) opposite its slope from back_prop. Too big an alpha and accuracy explodes or oscillates, too small and it stalls, the one knob to retune if training misbehaves.',
        'fit() chops the training images into batch_size chunks, reshuffled every epoch, and takes one forward_prop + back_prop + gradient step per chunk instead of one slow step over everything. Every 10th epoch it checks accuracy on the whole training set. Below the class, X/Y/X_val/Y_val are reshaped so pixels are rows and images are columns (what forward_prop expects), then a NeuralNet is built and trained for 100 epochs.',
        "Runs the trained model once on X_val, the slice it never trained on, for a real accuracy number, since training accuracy alone can hide overfitting. Then plots 90 validation digits with their true label and the model's guess, green when they match and red when they don't, since the true label is known here, unlike test.csv.",
        "test.csv has no label column (Kaggle-style: scored on submission, not told the answer), so this only produces guesses, not an accuracy number. Predictions go into submission.csv as ImageId/Label pairs, and the same grid plot repeats but shows only the guess, no color code, because there is no ground truth to check it against.",
      ],
      outs: [],
    },
    {
      file: 'layer_week3.py', title: 'Depth experiment', cutAt: /^\s*#\s*===== /,
      note: 'Depth compared: 1x10, 2x100, 3x1000.',
      does: [
        "Same MNIST load/split as MLP_train_week2.py: 784 pixel columns scaled to 0-1, 10% held out (stratified) as X_val/Y_val so there is a real accuracy to check against.",
        "sigmoid, not relu, is the activation for every hidden layer here; softmax stays on the output. one_hot, get_predict and get_accuracy are the same helpers as week 2.",
        "The big change from week 2: W1/b1/W2/b2 become self.W and self.b, Python lists built from hidden_sizes, one weight matrix and bias per layer. Pass [10] and this builds week 2's exact 1-hidden-layer shape; pass [100,100] or [1000,1000,1000] and the same class builds a 2- or 3-hidden-layer network, no new code.",
        "Loops over self.W instead of writing out Z1/A1/Z2/A2 by hand: every layer gets sigmoid except the last, which gets softmax. Z and A are lists so back_prop can walk them in reverse.",
        "Same chain-rule shape as week 2 (dZ, then dW/db, then push dZ back with deriv_sigmoid), just run backward through however many layers this network has instead of two fixed blocks.",
        "Adds two things week 2 didn't have: epoch timing (time.perf_counter per epoch) and early-stop tracking. epochs_to_target records the first epoch where val_acc reaches 85%, without actually stopping training, so different depths can be compared fairly on the same budget.",
        "Three configs from the slide: 1 layer of 10 nodes, 2 layers of 100 nodes each, 3 layers of 1000 nodes each. Same learning rate, batch size and epoch budget for all three, so depth/width is the only thing that changes between runs.",
        "Two tables: epochs needed to reach 85% validation accuracy (or '>200' if it never did), plus final accuracy and average seconds per epoch, one row per config. Then the full every-10-epochs history for each.",
      ],
      outs: [],
    },
    {
      file: 'activation_week3.py', title: 'Activation experiment', cutAt: /^\s*#\s*===== /,
      note: 'ReLU, sigmoid and tanh compared.',
      does: [
        "Same MNIST load/split as MLP_train_week2.py: 784 pixel columns scaled to 0-1, 10% held out (stratified) as X_val/Y_val so there is a real accuracy to check against.",
        "Three activations plus their derivatives, relu/deriv_relu, sigmoid/deriv_sigmoid, tanh/deriv_tanh, the same three from the Try it widget on the chapter page, collected in ACTIVATIONS so a name string picks out the matching (function, derivative) pair. softmax, one_hot, get_predict, get_accuracy and init_params are the same helpers as week 2.",
        "Same 1-hidden-layer shape as week 2's NeuralNet (W1/b1/W2/b2, not lists), but relu is no longer hard-coded: __init__ looks up ACTIVATIONS[activation_name] and stores the pair as self.act/self.deriv_act, so the rest of the class never needs an if/else for which activation is in use.",
        "Identical to week 2's forward_prop, except A1 = self.act(Z1) calls whichever activation this instance was built with, instead of always relu.",
        "Identical to week 2's back_prop, except dZ1 is pushed back through self.deriv_act(Z1), the derivative that matches whichever activation forward_prop used.",
        "Same early-stop and per-epoch timing as layer_week3.py's fit: records the first epoch that reaches 85% validation accuracy and the average seconds per epoch, so the three activations can be compared on how fast they learn, not just whether they eventually get there.",
        "Trains one model per entry in ACTIVATIONS (relu, sigmoid, tanh), same learning rate, batch size and epoch budget for all three, so activation choice is the only thing that changes between runs.",
        "Same two-table report as layer_week3.py: epochs to 85% validation accuracy (or '>200'), final accuracy and avg seconds/epoch per activation, then the full history.",
      ],
      outs: [],
    },
  ],
  'circuits-arduino-gpio/led-blink-and-active-levels': [
    {
      file: 'digital.ino', title: 'Active high and active low', lang: 'cpp',
      note: 'Active-high and active-low LEDs.',
      cutLines: [17, 22, 29],
      labels: ['The task and the wiring', 'Pin names', 'setup()', 'loop(): four steps'],
      does: [
        "The task: L1 and L2 are wired active high, so they light when the pin is HIGH. R1 and R2 are wired active low, so they light when the pin is LOW.\n\nIn the active-low wiring the LED's anode goes to 5V and its cathode goes through a resistor to the pin, so the pin has to sink the current. Many cheap motor-driver and relay boards invert one side like this.",
        "Names for the four pins. #define makes the compiler swap each name for its number before compiling, so L2 means 6, L1 means 7, R1 means 8 and R2 means 9. The comments remind you which two are active high and which two are active low.",
        "pinMode(pin, OUTPUT) makes all four pins outputs. setup() runs once, when the board powers up or resets.",
        "loop() repeats forever, and each step writes all four pins and then waits.\n\nStep 1 writes HIGH to all four: L1 and L2 light, R1 and R2 stay dark. Step 2 writes LOW to all four, which swaps it: R1 and R2 light, L1 and L2 go dark. Step 3 lights L2 and R1 (a diagonal pattern), and step 4 turns everything off for a 1 second pause before it starts again.",
      ],
      outs: [],
    },
    {
      file: 'fade.ino', title: 'PWM brightness fade', lang: 'cpp',
      note: 'Three LEDs fading with analogWrite().',
      cutLines: [11, 15, 21, 55],
      labels: ['The task and the wiring', 'Pin names', 'setup()', 'loop(): one LED at a time', 'loop(): all three cross-fade'],
      does: [
        "Three LEDs on pins 9, 10 and 11, each through a 220 ohm resistor to GND. The pins must be PWM-capable (marked ~ on an Uno: 3, 5, 6, 9, 10, 11).\n\nanalogWrite() does not make a real analog voltage. It switches the pin on and off very fast, and the share of time it is on sets the brightness.",
        "Names for the three PWM pins, with a reminder that each must be a ~PWM pin.",
        "All three pins are set as outputs. analogWrite sets the pin mode itself on some boards, but pinMode keeps the code honest and portable.",
        "For each LED the first for loop counts i from 0 to 255 and calls analogWrite(LED, i), so the brightness climbs one step every 5 ms (about 1.3 seconds from off to full). The second for loop counts back down. delay(1000) then waits a second before the next LED takes its turn.\n\nanalogWrite takes 0 (always off) to 255 (always on), and 128 is on about half the time.",
        "All three together. LED_1 and LED_3 go up with i while LED_2 gets 255 - i, so it goes down at the same time, and then the whole thing runs in reverse. After the last second of waiting, loop() starts again from the first LED.",
      ],
      outs: [],
    },
  ],
  'circuits-arduino-gpio/button-pull-up-and-pull-down': [
    {
      file: 'binary.ino', title: 'Pull-up, pull-down and a binary counter', lang: 'cpp',
      note: 'Two buttons driving a binary counter.',
      cutLines: [22, 30, 37, 49, 74],
      labels: ['The task and the wiring', 'Pin names', 'State variables', 'setup()', 'loop(): read, debounce, count', 'showBinary()'],
      does: [
        "Button A uses the internal pull-up resistor: one leg to pin 2 and the other leg to GND, with no external resistor, so the pin reads HIGH when idle and LOW when pressed.\n\nButton B uses an external pull-down: 5V to the button, the button to pin 3, and a 10 kilohm resistor from pin 3 to GND. The resistor holds the pin LOW when idle, and pressing the button makes it HIGH.\n\nEither button adds one to a counter from 0 to 15, shown in binary on four LEDs (pin 8 is the lowest bit and pin 11 the highest).",
        "Names for the two buttons and the four LED bits. BUTTON_PULLUP is active LOW (pressed reads LOW) and BUTTON_PULLDOWN is active HIGH (pressed reads HIGH).",
        "DEBOUNCE_MS is a 50 ms dead time after an accepted press. counter holds the number being shown. lastPullUpState starts at HIGH and lastPullDownState starts at LOW, which are the idle states, so the first read is not mistaken for a press. lastDebounceTime remembers when the last press was accepted.",
        "INPUT_PULLUP switches on the board's internal resistor for pin 2. Pin 3 is a plain INPUT because the external resistor does the pull-down. The four LED pins are outputs, and showBinary(counter) draws the starting pattern 0000.",
        "Each pass reads both buttons, and only checks them if more than 50 ms have passed since the last accepted press. That is the debounce: a mechanical switch bounces for a few milliseconds and would otherwise look like many presses.\n\nThe pull-up button counts when it changes from HIGH to LOW, and the pull-down button when it changes from LOW to HIGH, so the code reacts to the moment of pressing and not to holding the button. (counter + 1) % 16 counts up and wraps from 15 back to 0. At the end the current states are saved as the 'last' states for the next pass.",
        "value >> n slides the bits to the right so that bit n lands in the lowest place, and & 1 keeps only that bit, giving 0 or 1. digitalWrite sends it to the matching LED, so the number 5 (binary 0101) lights bit 0 and bit 2.",
      ],
      outs: [],
    },
  ],
  'circuits-arduino-gpio/the-voltage-divider': [
    {
      file: 'ldr.ino', title: 'LDR lux meter', lang: 'cpp',
      note: 'An LDR lux meter on an I2C LCD.',
      cutLines: [18, 22, 28, 41, 52],
      labels: ['The task and the wiring', 'Library and LCD object', 'Constants', 'setup()', 'loop(): from reading to lux', 'loop(): show the result'],
      does: [
        "The LDR (a light-dependent resistor) forms a voltage divider with a fixed 4.7 kilohm resistor, and the middle point goes to A0. The header's wiring is 5V, then the 4.7k resistor, then the middle node, then the LDR to GND. The LCD is a 16 by 2 character display on I2C (address 0x27) using SDA and SCL, which are A4 and A5 on an Uno.\n\nThe header says the order matters: swapping the resistor and the LDR makes the lux maths read backwards.",
        "#include brings in the LiquidCrystal_I2C library, which you install from the Library Manager. lcd(0x27, 16, 2) creates the display object with its I2C address, 16 columns and 2 rows.",
        "LDR_PIN is A0. Rref = 4.7 is the fixed resistor in kilohms. RL10 = 50 is the LDR's resistance at 10 lux in kilohms, and GAMMA = 0.7 is the slope of its resistance against light. The last two come from the datasheet, so for a different LDR the lux value is only a rough estimate.",
        "Starts the serial port at 9600, then lcd.init() and lcd.backlight() turn the display on. It clears the screen, shows 'Light Sensor' on the first row and 'Initializing...' on the second, and waits 2 seconds.",
        "analogRead gives 0 to 1023 for 0 to 5 V. The line `if (analogValue < 1) analogValue = 1` stops a divide-by-zero in the next steps. Vout converts the reading to volts. Then R = Rref * (5 / Vout - 1) turns the voltage into a resistance in kilohms, and the datasheet curve is rearranged into lux = (RL10 * 1000 * 10^GAMMA / (R * 1000))^(1 / GAMMA).\n\nCheck the divider orientation against this formula. R = Rref * (Vin / Vout - 1) is the unknown resistor's value when the unknown resistor is on the 5V side and Rref goes to GND. With the wiring in the header (Rref on the 5V side, the LDR to GND), the LDR resistance would be Rref * Vout / (5 - Vout) instead, so as written the lux reading may move the wrong way.",
        "lcd.clear() wipes the screen, then 'Brightness:' goes on the first row and the lux on the second with lcd.print(lux, 0), which means 0 decimals, followed by ' lux'. delay(1000) makes it update once a second.",
      ],
      outs: [],
    },
  ],
  'circuits-arduino-gpio/ultrasonic-sensor-hc-sr04': [
    {
      file: 'valve.ino', title: 'Tank level and servo valve', lang: 'cpp',
      note: 'A tank level gate with a servo valve.',
      cutLines: [23, 26, 38, 54, 73, 89],
      labels: ['The task and the wiring', 'Libraries', 'Pins, objects and constants', 'setup()', 'loop(): measure the level', 'loop(): move the valve', 'loop(): show it on the LCD'],
      does: [
        "The HC-SR04 sits on the tank lid and measures the distance down to the water. Below 30% full the valve opens to fill the tank, above 80% it closes, and between 30% and 80% it keeps the position it already has.\n\nWiring: the sensor's Trig is on pin 9 and Echo on pin 10 (Echo is 5V, so use a resistor divider on a 3.3V board). The SG90 servo takes 5V and GND and has its signal on pin 6. The LCD is the same I2C display as the lux meter.",
        "Servo.h is bundled with the Arduino IDE and drives the hobby servo. LiquidCrystal_I2C is the LCD library from the Library Manager.",
        "trigPin, echoPin and servoPin name the three pins. valveServo is the servo object and lcd is the display. SOUND_SPEED is 0.034 cm per microsecond (about 340 m/s). TANK_HEIGHT_CM = 200 is the distance from the sensor to the tank bottom when the tank is empty, so recalibrate it for your own container. The two angles are 90 degrees for open and 0 for closed.",
        "Starts the serial port, sets Trig as an output and Echo as an input, and attaches the servo to its pin. It then starts the LCD and shows 'Tank Level Gate' and 'Initializing...' for 2 seconds.",
        "The sensor is triggered with a clean pulse: Trig LOW for 2 microseconds, HIGH for 10 microseconds, then LOW. pulseIn(echoPin, HIGH) times how long Echo stays HIGH, in microseconds. distanceCm = duration * SOUND_SPEED / 2, halved because the sound travels down and back.\n\nThe water level is the tank height minus that distance, and levelPercent is the level as a percentage of the tank, clamped between 0 and 100. If the echo never comes back, pulseIn returns 0 and the sketch reads that as a full tank, which would close the valve, so a timeout or a sanity check would make it safer.",
        "Below 30% the servo is written to 90 degrees (open) and above 80% to 0 (closed). Between the two nothing is written, and the status text comes from valveServo.read(), which gives the last angle that was written.\n\nThe gap between 30% and 80% is called hysteresis. It stops the valve from flapping open and shut every time the level wobbles around a single threshold.",
        "Clears the display, then writes the level on the first row, such as 'Lvl: 42%', and the valve state on the second row, such as 'VALVE: OPEN'. delay(500) makes it update twice a second.",
      ],
      outs: [],
    },
  ],
  'physics-in-robotics/circular-motion': [
    {
      chapter: 'physics-in-robotics/project-setup',
      file: 'exercise.ino', title: 'Warm-up exercises', lang: 'cpp',
      note: 'Serial warm-ups and a motor command.',
      cutLines: [6, 45, 53, 64, 73, 84, 92, 109, 127],
      labels: ['Include and pins', 'Variables for questions 1 to 9', 'setup(): serial and motors', 'Q1: add the date', 'Q2: baht to dollars', 'Q3: circumference', 'Q4: one expression', 'Q5: acceleration', 'Q8 and Q9: counting loops', 'loop(): Q6 and Q7'],
      does: [
        "Brings in the motor library from the src folder and names the two bus settings: DirectionPin 4 is the RS485 direction switch and BaudRate 115200 is the speed of the motor bus.",
        "All the variables for the questions, grouped by comment. Q1 holds a date (25, 11, 2009) and a sum. Q2 holds 100 baht and a rate of 0.03. Q3 holds a radius of 14 and pi as 3.14. Q4 holds five whole numbers and a long result. Q5 holds the velocities and time. Q6 and Q7 hold two motor speeds, a move time and a position. Q8 and Q9 share one counter, i.\n\nThe last line, `int i = 1`, has no semicolon, so this file does not compile until you add one.",
        "Opens the serial monitor at 115200, and `while (!Serial);` waits until it is open. Motor.begin starts the motor bus, then wheel 1 turns LEFT at innerRPM (18) and wheel 2 is set to 0, so it is stopped.",
        "Q1 adds the day, month and year: 25 + 11 + 2009 = 2045. Serial.print writes on the same line and Serial.println ends the line, so the date prints as 25/11/2009 followed by the sum labelled Sigma.",
        "Q2 converts baht to dollars with usd = thb * rate, which is 100 * 0.03 = 3. Arduino prints a float with 2 decimals, so it shows 3.00.",
        "Q3 is the circumference of a circle: c = 2 * pi * r = 2 * 3.14 * 14 = 87.92.",
        "Q4 is one expression: num5 * num1 + num2 * num3 + num4, which is 9 * 5 + 6 * 6 + 1 = 82. Multiplication happens before addition.",
        "Q5 is acceleration, a = (v_f - v_i) / t = (5 - 10) / 4 = -1.25. The negative sign means it is slowing down. Serial.print(a, 2) prints it with 2 decimals, followed by the unit m/s^2.",
        "Q8 is a for loop that counts i from 1 to 10 and prints each number every 0.5 seconds, then prints 'Count Complete'.\n\nQ9 is meant to do the same with a while loop, but it never runs: the for loop leaves i at 11, because ++i runs once more before the test i <= 10 fails, and nothing sets i back to 1. So the second 'Count Complete' prints straight away.",
        "Q6 adds 10 to motor1Position on every pass, wraps it back to 0 after 360, and prints it. Q7 uses that position to drive wheel 2: above 270 it turns LEFT at outerRPM, below 90 it turns RIGHT at outerRPM, and in between it stops. delay(100) at the top and delay(5000) at the bottom make each pass about 5 seconds long.",
      ],
      outs: [],
    },
    {
      file: 'circular.ino', title: 'Drive a circle', lang: 'cpp',
      note: 'Drive the robot round a 30 cm circle.',
      cutLines: [6, 15, 26],
      labels: ['Include, pins and the task', 'The numbers: angle, time and radii', 'setup(): run the circle', 'loop(): empty'],
      does: [
        "Includes the motor library and names the RS485 direction pin (4) and the bus speed (115200). The task in the comment is to drive the robot once round a circular track with a 30 cm radius.",
        "theta = 360 is a full circle and t = 20000 is the time allowed in milliseconds. innerr = 21 and outerr = 37 are the radii in centimetres of the circles the inner and the outer wheel follow, so the middle of the robot follows about 29 cm, close to the track.\n\nTo cover an arc of angle theta at radius R, a wheel of radius r has to roll arc length (theta / 360) * 2 * pi * R. Dividing by the wheel circumference 2 * pi * r gives the number of turns, and 60000 / t converts that into turns per minute. The 2 * pi cancels, which leaves RPM = theta * R * 60000 / (r * t * 360). In the code the 3 in the divider is the wheel radius in centimetres. With these numbers the inner wheel needs 21 RPM and the outer wheel 37 RPM.\n\nThe line `int wheelr = 3.5` is an int, so it is stored as 3, and the formulas use the number 3 directly and never read wheelr.",
        "Opens the serial port and the motor bus, and waits 10 seconds so you can put the robot on the track. Wheel 1 then runs LEFT at the inner RPM and wheel 2 runs RIGHT at the outer RPM. The wheels are mounted facing opposite ways, so LEFT on one and RIGHT on the other drive both forward. delay(t - 1000) keeps them running for 19 seconds, and then both wheels are set to 0.\n\nEverything happens in setup(), so the robot drives one lap and stops.",
        "Empty on purpose. The whole run happens once in setup().",
      ],
      outs: [],
    },
        {
      file: 'star.ino', title: 'Drive a star', lang: 'cpp',
      note: 'Drive the robot round a five-point star.',
      cutLines: [6, 18, 24, 29, 39, 47, 56, 64, 73, 88],
      labels: ['Include, pins and the task', 'Angles, times and radii', 'RPM for each turn', 'setup()', 'forward()', 'turn1(): right turn', 'turn1(): the other version', 'turn2(): left turn', 'turn2(): the other version', 'execute()', 'loop()'],
      does: [
        "Includes the motor library and names the RS485 direction pin (4) and the bus speed (115200). The task is to drive the robot along the outline of a five-point star.",
        "A star has five points. The robot goes forward, turns right by theta2 = 72 degrees, goes forward, then turns left by theta3 = 144 degrees, and repeats that five times. t1, t2 and t3 are 5000 ms each for the forward run and the turns. innerr and outerr are both 15 cm, the distance between the wheels, and wheelr is the wheel radius.",
        "constantrpm = 20 is the speed on the straight sides. The four turn speeds come from one formula: angle * radius * 60000 / (3 * time * 360), the same idea as in the circle file. Because innerr and outerr are equal here, innerrpm1 equals outerrpm1 and innerrpm2 equals outerrpm2.",
        "Opens the serial port and the motor bus. Nothing moves yet, because the work happens in execute().",
        "The comment says wheel 1 is the left one and wheel 2 the right one. forward() turns wheel 1 LEFT and wheel 2 RIGHT at constantrpm, so both push the robot the same way, waits t1 milliseconds, then sets both speeds to 0.",
        "A right turn: only wheel 1 runs, at innerrpm1, while wheel 2 stays at 0, so the robot pivots on its right wheel. It waits t3 and then stops both wheels. The comment 'Check LR Status when Run' reminds you to test which way it actually turns.",
        "This commented-out version is marked RECOMMENDED. It turns wheel 1 at a fixed 17 RPM instead of the calculated one. It is a fixed number instead of the calculated one.",
        "A left turn: only wheel 2 runs, at outerrpm1, and wheel 1 stays at 0. The delay is t3 + 4000, 9 seconds, because the left turn is 144 degrees, twice as big as the right one, and the formula was not given a different time.",
        "The commented-out RECOMMENDED left turn uses a fixed 34 RPM for wheel 2, twice the right turn's 17. That matches the left turn being twice the angle, so it is the value to use on the robot.",
        "The main routine. It waits 10 seconds so you can put the robot on the track, then repeats five times: forward, a 3 second pause, a right turn, a pause, forward, a pause and a left turn. The pauses let the robot settle before the next move.",
        "loop() runs execute() once and then `while(1);` holds the program there forever, so the star is driven only once.",
      ],
      outs: [],
    },
  ],
  'physics-in-robotics/the-final-mission': [
    {
      file: 'final.ino', title: 'Final mission', lang: 'cpp',
      note: 'A route through five checkpoints.',
      cutLines: [16, 23, 34, 43, 57, 69, 88, 109, 126, 145, 157],
      labels: ['Settings and robot constants', 'rpm_unit: centimetres to RPM', 'setup(): start and run', 'stop()', 'execute(): to Box 1', 'execute(): pivot and back to Box 2', 'execute(): return, turn and Box 3', 'execute(): Box 4, adjust and Box 5', 'execute(): align, left pivot, 34 cm', 'execute(): the 180 degree arc', 'execute(): 60 degree turn and the final dash', 'loop(): empty'],
      does: [
        "Brings in the motor library and ESP32Servo for the arm on GPIO 16. DirectionPin is the RS485 direction switch (GPIO 4) and BaudRate is the bus speed. Servo myservo is the servo object.\n\nThe constants describe the robot: wheelr = 3 cm is the wheel radius, track = 15 cm is the distance between the wheels, PI_VAL is pi, and t = 3000 is the time window in milliseconds that every command gets.",
        "rpm_unit is the RPM needed to roll one centimetre in t milliseconds: (distance / circumference) * (minutes / time). 1 / (2 * pi * r) is how many wheel turns one centimetre needs (about 0.053 with a 3 cm radius), and 60000 / t scales turns per window into turns per minute. With these numbers rpm_unit is about 1.06.\n\nSo any distance in centimetres times rpm_unit is the wheel speed that covers it in t. For example, 47 cm needs about 50 RPM.",
        "Starts the serial port, opens the motor bus with Motor.begin and attaches the servo to pin 16. It waits 5 seconds so you can step back, and then runs the whole route once through execute().",
        "Sets both wheels to 0 RPM and waits 1 second so the robot settles before the next move. Every stage ends by calling it.",
        "Stage 1: both wheels run at 47 * rpm_unit for t, so the robot rolls 47 cm to Box 1. Wheel 1 is LEFT and wheel 2 is RIGHT because the motors face opposite ways, so that pair means forward. After stop() it waits 3 seconds at the checkpoint, then backs off 7 cm by swapping both directions.",
        "dist90 = (2 * pi * track) * 0.25 is the length of a quarter circle whose radius is the 15 cm track. When the robot pivots on one wheel, the other wheel travels along that arc, so running one wheel for dist90 turns the robot 90 degrees. Here wheel 1 runs backward and wheel 2 is held at 0, which pivots the robot back to the right. It then drives backward 44 cm.",
        "After a 2 second checkpoint at Box 2, the robot drives 44 cm forward, turns 90 degrees right (wheel 1 forward, wheel 2 held at 0) and creeps 5 cm toward Box 3, where it waits 2 seconds.",
        "22 cm forward to Box 4 and a 2 second checkpoint. Two pivots on wheel 1 follow, one forward and one backward, which the comments call orientation adjustments. Then 22 cm backward to Box 5, with another 2 second checkpoint.",
        "After the checkpoint at Box 5 it backs off 5 cm, pivots 90 degrees to the left (wheel 2 drives and wheel 1 is held at 0), and drives 34 cm forward.",
        "A curve needs the two wheels at different speeds, because the outer wheel travels a longer arc than the inner one. theta = 180 degrees, t2 = 10 seconds, inner radius 11 cm and outer radius 27 cm. The RPM formula is the one from the circular-motion file: theta * radius * 60000 / (3 * t2 * 360), where 3 is the wheel radius in centimetres. This works out to 11 RPM for the inner wheel and 27 RPM for the outer wheel.\n\nWheel 1 gets the inner RPM and wheel 2 the outer RPM for t2 - 1000 milliseconds, and then the robot drives 16 cm straight.",
        "dist60 uses the same arc idea for 60 degrees: 2 * pi * track * 60 / 360. Wheel 2 runs while wheel 1 is held at 0, so the robot pivots 60 degrees. The final dash is 29 cm forward.",
        "Empty on purpose. The whole route runs once inside setup(), so after the last stop() the robot just sits there.",
      ],
      outs: [],
    },
  ],
  'physics-in-robotics/motor-protocol-dynamixel-2-0': [
  ],
  'line-chatbot/webhook-and-database': [
    {
      file: 'main.txt', title: 'Final webhook', lang: 'js',
      note: 'The final webhook with seven commands.',
      cutLines: [10, 29, 49, 68, 87, 107, 126, 154, 202, 209, 233, 240],
      labels: ['Database configuration', 'doPost(): receive and parse', 'Start and Check', 'Equipment booking', 'Equipment return', 'Room book and return', 'Logs', 'Add a new item', 'Result0(): the carousel menu', 'Result1(): update notice', 'Result2(): the item card', 'Result3(): plain text', 'buildReply(): the Dialogflow wrapper'],
      does: [
        "Opens the Google Spreadsheet the bot uses as its database and picks its three sheets: Inventory (the stock and room list), Equip Log (borrow and return records) and Room Log (room entry and exit records). The link in the original file was replaced with YOUR_SPREADSHEET_URL here, because it pointed to a real inventory sheet.",
        "doPost(e) is the webhook, and Google Apps Script calls it every time Dialogflow sends a POST request. The body is JSON, JSON.parse turns it into an object, and data.originalDetectIntentRequest.payload.data.message.text digs out the text the user typed in LINE.\n\nIt then reads all three sheets into arrays in one go (starting at row 2 to skip the header), splits the message on commas into command (the first part is the command name, the rest are its values), and builds a timestamp in the GMT+7 time zone. The leading apostrophe stops Sheets from turning the text into a date.",
        "Condition 00: the message 'Start' returns Result0(), the carousel menu.\n\nCondition 01: 'Check,ID' first checks that an ID was given, and otherwise returns an error that shows the syntax. It then loops over the Inventory rows until column 1 equals the ID and reads the item name (column 2), the image URL (column 6) and the quantity or status (column 5). rowIdx is i + 2 because the data starts on row 2 and the array starts at 0. Result2 shows it as a card. If no row matches, nothing is returned.",
        "Condition 02: 'Equipment booking,ID,QTY,NAME'. It needs 4 parts, finds the item row, reads the current stock, subtracts the quantity and writes the new number back into Inventory. appendRow adds a line to Equip Log with the name, item ID, quantity, timestamp and the word 'Book'. Result1 replies with the item name and the new stock. Nothing checks that the stock stays above 0.",
        "Condition 03 is the same as booking with the sign reversed: the quantity is added back to the stock, and the log line says 'Return'.",
        "Conditions 04 and 05 share one branch. isBooking is true for 'Room book' and false for 'Room return'. The room's row is found by its ID in Inventory, its status in column 5 is set to 'Occupied' or 'Unoccupied', and a log line with 'Enter' or 'Leave' goes to Room Log.",
        "Condition 06: 'Equipment log,USER' or 'Room log,USER'. Depending on the command it searches the in-memory copy of the equipment log or the room log for rows whose first column equals the name, and builds a text summary line by line: timestamp, action, quantity and item. If nothing matches it says no logs were found.",
        "Condition 07: 'Add,ID,NAME,QTY,ADMIN' needs 5 parts. It first loops over the Inventory IDs to check the new ID does not exist yet, and returns an error if it does. Otherwise it appends the new item to Inventory (with N/A for the category and description) and writes an 'Add' line to Equip Log with the admin name. ADMIN_NAME is only text and is not checked as a password.",
        "Builds the carousel, a LINE template message with three cards (Equipment, Room Booking, Activity Logs), each with an image and three buttons. A button of type 'message' sends its text as if the user had typed it, so the buttons send ready-made commands such as 'Check,ID'. buildReply wraps the payload for Dialogflow.",
        "A plain text reply for successful updates: the item name and its new status or stock.",
        "A Flex Message, LINE's card layout language. The bubble has a hero image from the sheet's image URL and a body with the item name in large bold text and a status line beneath it.",
        "A general text reply used for error messages and for the log summaries.",
        "Wraps any LINE message in the format Dialogflow expects, a fulfillmentMessages list with a custom payload (type 4) for the line platform, and returns it as JSON through ContentService.",
      ],
      outs: [],
    },
    {
      file: 'v5.txt', title: 'Version 5', lang: 'js',
      note: 'Almost the final file.',
      cutLines: [10, 29, 49, 68, 87, 107, 126, 154, 202, 209, 233, 240],
      labels: ['Database configuration', 'doPost(): receive and parse', 'Start and Check', 'Equipment booking', 'Equipment return', 'Room book and return', 'Logs', 'Add a new item', 'Result0(): the carousel menu', 'Result1(): update notice', 'Result2(): the item card', 'Result3(): plain text', 'buildReply(): the Dialogflow wrapper'],
      does: [],
      outs: [],
    },
    {
      file: 'v4.txt', title: 'Version 4', lang: 'js',
      note: 'Full command names and the Add command.',
      cutLines: [6, 128, 203],
      labels: ['Spreadsheet and sheets', 'doPost(): full command names', 'The UI functions', 'buildReply()'],
      does: [
        "Opens the spreadsheet and the three sheets. The link was replaced with YOUR_SPREADSHEET_URL here.",
        "The commands now use the full names the final version keeps: 'Equipment booking', 'Equipment return', 'Room book', 'Room return', 'Equipment log' and 'Room log'. The Add command is new in this version, with a check that the new ID does not exist yet. Room booking and returning share one branch, and so do the two logs.",
        "The Result0 carousel and the Result1, Result2 and Result3 replies. Each builds its own message and passes it to buildReply.",
        "The helper that wraps every LINE payload into the Dialogflow format.",
      ],
      outs: [],
    },
    {
      file: 'v3.txt', title: 'Version 3', lang: 'js',
      note: 'Merged branches and an action variable.',
      cutLines: [6, 121, 196],
      labels: ['Spreadsheet and sheets', 'doPost(): the action variable', 'The UI functions', 'buildReply()'],
      does: [
        "Opens the spreadsheet and the three sheets. The link was replaced with YOUR_SPREADSHEET_URL here.",
        "Same short commands as version 2 (Start, Check, Ebook, Ereturn, Rbook, Rreturn, Elog, Rlog), but the first part of the message is stored once in `var action = command[0]` and every branch tests `action`, which reads better. It still has no Add command.",
        "The carousel and the three reply builders.",
        "The helper that wraps every LINE payload into the Dialogflow format.",
      ],
      outs: [],
    },
    {
      file: 'v2.txt', title: 'Version 2', lang: 'js',
      note: 'Merged branches and a shared helper.',
      cutLines: [6, 100, 175],
      labels: ['Spreadsheet and sheets', 'doPost(): merged branches', 'The UI functions', 'buildReply()'],
      does: [
        "Opens the spreadsheet and the three sheets. The link was replaced with YOUR_SPREADSHEET_URL here.",
        "Still the short command names, but Rbook and Rreturn are now one branch that uses an isBooking flag, and Elog and Rlog are one branch that picks which log to search. The file shrinks from 310 lines to 185.",
        "The four reply functions are much shorter now.",
        "A helper that wraps every LINE payload in the Dialogflow format, so each reply function only builds its own message.",
      ],
      outs: [],
    },
    {
      file: 'v1.txt', title: 'Version 1', lang: 'js',
      note: 'The first full version.',
      cutLines: [6, 161, 184, 206, 288],
      labels: ['Spreadsheet and sheets', 'doPost(): one branch per command', 'Result0(): the start menu', 'Result3(): text replies', 'Result2(): the item card', 'Result1(): update notice'],
      does: [
        "Opens the spreadsheet and the three sheets Inventory, Equip Log and Room Log. The link was replaced with YOUR_SPREADSHEET_URL here.",
        "The first full version, with one if / else-if branch per short command: Start, Check, Ebook and Ereturn (equipment book and return), Rbook and Rreturn (room), and Elog and Rlog (logs). Each branch finds the item row by looping over Inventory, updates the stock or the room status, appends a line to the right log sheet and calls a Result function. The room branches and the log branches are written out twice, which is the repetition the next version cleans up.",
        "The start menu: a LINE carousel written as one long JSON object.",
        "A text reply used for summaries and errors.",
        "The item card as a Flex Message, about 80 lines of JSON with the picture, the name and the status.",
        "The update notice, a short text message showing the item and its status.",
      ],
      outs: [],
    },
    {
      file: 'prototype.txt', title: 'Prototype', lang: 'js',
      note: 'The first proof of concept.',
      cutLines: [3, 37],
      labels: ['Spreadsheet and sheet', 'doPost(): add or remove stock', 'Result(): the flex card'],
      does: [
        "Opens the spreadsheet and its STOCK sheet. The link was replaced with YOUR_SPREADSHEET_URL here.",
        "The first webhook. The user's text is split on commas. 'add,ID,QTY' loops over the STOCK rows to find the item, reads its name (column 2), picture (column 6), price (column 3) and stock (column 5), adds the quantity and writes the new stock back. 'remove,ID,QTY' does the same with a subtraction. It then answers with Result(), the card.",
        "One big Flex Message: the item picture at the top, the name, a rating row with star images and '4.0', then 'left over' with the stock and 'Price' with the price, and two buttons, CALL and WEBSITE. It is returned as JSON for Dialogflow.",
      ],
      outs: [],
    },
  ],
};

// v5.txt is the same code as the MAIN file apart from two small text changes and an emoji, so it shares the MAIN explanations
(() => { const l = WORK['line-chatbot/webhook-and-database'], main = l.find(x => x.file === 'main.txt'), five = l.find(x => x.file === 'v5.txt'); five.does = main.does.map((d, i) => i === 8 ? d + "\n\nHere the Borrow button sends 'Equipment book,ID,QTY,USER', which does not match the command 'Equipment booking' that doPost listens for. The final file fixes it." : i === 9 ? d + ' This version starts the text with a check-mark emoji.' : d); })();

// where each class's files are kept: the whole-course repo (for "Copy clone link") and that class's own folder in it (for the GitHub button)
const REPOS = {
  'basic-python': { repo: 'https://github.com/eai-spsm/M.4-Classwork', folder: 'https://github.com/eai-spsm/M.4-Classwork/tree/main/Code%20-%20Basic%20Python' },
  'circuits-arduino-gpio': { repo: 'https://github.com/eai-spsm/M.4-Classwork', folder: 'https://github.com/eai-spsm/M.4-Classwork/tree/main/Code%20-%20Microcontroller' },
  'physics-in-robotics': { repo: 'https://github.com/eai-spsm/M.4-Classwork', folder: 'https://github.com/eai-spsm/M.4-Classwork/tree/main/Code%20-%20Robot' },
  'line-chatbot': { repo: 'https://github.com/eai-spsm/M.4-Classwork', folder: 'https://github.com/eai-spsm/M.4-Classwork/tree/main/Code%20-%20Line%20Dialogflow' },
  'raspberry-pi-vision': { repo: 'https://github.com/eai-spsm/M.5-Classwork', folder: 'https://github.com/eai-spsm/M.5-Classwork/tree/main/Code%20-%20Raspi' },
  'computer-vision': { repo: 'https://github.com/eai-spsm/M.5-Classwork', folder: 'https://github.com/eai-spsm/M.5-Classwork/tree/main/Code%20-%20Computer%20Vision' },
  'ai-development': { repo: 'https://github.com/eai-spsm/M.5-Classwork', folder: 'https://github.com/eai-spsm/M.5-Classwork/tree/main/Code%20-%20Deeplearn' },
};
const wmain = $('#wmain');
// two or three lines about the whole file, shown above the cell explanation
const ABOUT = {
  "computer-vision/basics.py": "A twelve-step walkthrough of the basic OpenCV commands, from reading a picture to transforms and edges. Each step opens its own window.",
  "computer-vision/overlay.py": "Opens the webcam and draws shapes and a live clock on every frame. It shows how drawing commands work on video, not only on pictures.",
  "computer-vision/ellipse.py": "Draw ellipses on a picture with the mouse. It shows how OpenCV mouse events and a preview copy work.",
  "computer-vision/picker.py": "Click a pixel on a picture and the program prints its blue, green and red values. Use it to find the colours you want to detect.",
  "computer-vision/hsv_mask.py": "Reads the webcam and keeps only three colours by turning each frame into HSV and masking a range. Each colour gets its own window.",
  "computer-vision/exam.py": "Runs the Haar face detector over a whole folder of 120 pictures and saves the ones with faces. It was the midterm task.",
  "computer-vision/haar.py": "Finds faces and eyes with Haar cascades, first on one photo and then on the live webcam. A good first look at object detection.",
  "computer-vision/hide_face.py": "Detects the face on the webcam and paints a black box over it. It shows how a detection result can be used to change the picture.",
  "computer-vision/step1_capture.py": "The first of three face-recognition steps. It captures face pictures from the webcam to train on.",
  "computer-vision/step2_train.py": "The second step. It reads the saved faces and trains an LBPH recogniser on them.",
  "computer-vision/step3_live.py": "The third step. It loads the trained recogniser and names each face on the live webcam.",
  "computer-vision/train_yolo.py": "Fine-tunes a small YOLO model on a vehicle dataset. It shows the few lines needed to train your own detector.",
  "computer-vision/hands.py": "Tracks the 21 landmarks of a hand with MediaPipe's current Tasks API and draws them on the webcam picture.",
  "computer-vision/hand_servo.py": "Finds the fingertip with MediaPipe, reads the colour under it and turns that colour into an angle for a servo.",
  "raspberry-pi-vision/atm.py": "A small ATM that runs in the terminal, with no hardware. A warm-up in plain Python before the GPIO weeks.",
  "raspberry-pi-vision/blink.py": "Blinks one LED on GPIO18 with the RPi.GPIO library. The first program that touches a real pin.",
  "raspberry-pi-vision/fade.py": "Fades an LED up and down on GPIO13 with PWM. It shows how a duty cycle controls brightness.",
  "raspberry-pi-vision/buttons.py": "Two buttons control one LED: one turns it on and the other turns it off. It practises reading inputs with a pull-up.",
  "raspberry-pi-vision/chaser.py": "Moves a light along five LEDs, with a step button and an auto button.",
  "raspberry-pi-vision/distance.py": "Measures distance with an HC-SR04 ultrasonic sensor and prints it. It turns an echo time into centimetres.",
  "raspberry-pi-vision/distance_leds.py": "The distance from the ultrasonic sensor chooses which LED pattern is shown. It combines a sensor, conditions and outputs.",
  "raspberry-pi-vision/motor_buttons.py": "Drives a DC motor through an L298N driver, forward or backward, with two buttons. The motor stops when none is held.",
  "raspberry-pi-vision/motor_cmd.py": "Controls the same motor by typing commands in the terminal instead of pressing buttons.",
  "raspberry-pi-vision/hand_servo.py": "Tracks a hand with the camera and points a servo where the finger points. It joins computer vision and hardware.",
  "raspberry-pi-vision/lcd.py": "Shows a counter on a 16x2 I2C LCD. It is the first program that talks to a display over I2C.",
  "raspberry-pi-vision/lcd_yolo.py": "Runs YOLO on the camera and writes the names of the objects it sees on the LCD. The vision project and the display together.",
  "raspberry-pi-vision/colors.py": "Samples the real RGB value of eight paper squares through the camera. The numbers are used to set up colour detection.",
  "raspberry-pi-vision/train.py": "Fine-tunes the smallest YOLO11 model on the CPU so that it is small enough to run on the Pi.",
  "raspberry-pi-vision/export.py": "Exports the trained best.pt file to NCNN and ONNX. These formats run faster on the Pi than the original file.",
  "raspberry-pi-vision/train_pc.py": "The first full training run of the box detector, done on a PC with a GPU, from a data.yaml dataset file.",
  "raspberry-pi-vision/live.py": "Loads the trained box detector and runs it on the webcam. It draws a box and a name around each detected object.",
  "basic-python/print.py": "Practice with print: strings and formatting, with one short question in each cell.",
  "basic-python/input.py": "Practice with input: reading what the user types and using it. Each cell is one exercise.",
  "basic-python/lists.py": "Data types and lists, in a set of numbered exercises. Each cell is one exercise.",
  "basic-python/if_else.py": "Seven numbered exercises on decisions with if, elif and else.",
  "basic-python/loops.py": "Exercises on repeating work with while and for loops. Each cell is one exercise.",
  "basic-python/functions.py": "Numbered exercises on writing your own functions with def. Each cell is one exercise.",
  "basic-python/dicts.py": "Exercises on tuples and dictionaries, from moderate to advanced.",
  "basic-python/oop.py": "Classes and objects, from a simple Employee to inheritance, @property and objects that hold objects. Nine small examples.",
  "basic-python/gui.py": "A step-by-step Tkinter tutorial in nine windows: labels, buttons, entries, layout, choices, a canvas, a menu and a clock.",
  "basic-python/os_demo.py": "Three examples of the os module, run on a made-up dataset folder.",
  "basic-python/sys_demo.py": "Three examples of the sys module: arguments, the environment and options.",
  "basic-python/numpy_demo.py": "Three NumPy examples that build up from arrays to one neuron. They prepare the maths of the AI chapters.",
  "basic-python/plot_demo.py": "Three Matplotlib examples, each saved to a picture file.",
  "basic-python/pandas_demo.py": "Three Pandas examples: build and clean a table, ask questions of it, and prepare it for a model.",
  "ai-development/MLP_train_week2.py": "A neural network built with only NumPy and trained on the MNIST digits. Every part of the training loop is written by hand.",
  "ai-development/layer_week3.py": "An experiment that compares networks of different depth: 1x10, 2x100 and 3x1000 neurons, on the same data.",
  "ai-development/activation_week3.py": "An experiment that compares ReLU, sigmoid and tanh as the activation function of the same network.",
  "circuits-arduino-gpio/digital.ino": "Two LEDs wired differently, one active high and one active low, driven by digitalWrite. It shows why the wiring changes the code.",
  "circuits-arduino-gpio/fade.ino": "Fades three LEDs with analogWrite. It shows PWM on an Arduino, where a number from 0 to 255 sets the brightness.",
  "circuits-arduino-gpio/binary.ino": "Two buttons, one with a pull-up and one with a pull-down, drive a binary counter on LEDs.",
  "circuits-arduino-gpio/ldr.ino": "Reads a light sensor (LDR), turns the voltage into lux and shows it on an I2C LCD.",
  "circuits-arduino-gpio/valve.ino": "Reads a tank level and opens or closes a servo valve. The level and the valve state show on the LCD.",
  "physics-in-robotics/exercise.ino": "Warm-up questions on the Arduino: dates, unit conversion, a circle and a loop. Ends with the first motor command.",
  "physics-in-robotics/circular.ino": "Drives the robot once round a circle with a 30 cm radius by giving the two wheels different speeds.",
  "physics-in-robotics/star.ino": "Drives the robot along a five-point star: forward, a right turn, forward, a left turn, five times.",
  "physics-in-robotics/final.ino": "The final mission: a route through five checkpoints with straight lines, pivots, a curve and an arm servo.",
  "line-chatbot/main.txt": "The final Google Apps Script behind the LINE bot. It receives a message, picks a command and updates the equipment sheet.",
  "line-chatbot/v5.txt": "Almost the final file: the same code as the final webhook, with two small text changes and an emoji.",
  "line-chatbot/v4.txt": "An earlier version with full command names and a new Add command.",
  "line-chatbot/v3.txt": "An earlier version where branches are merged and one action variable decides what to do.",
  "line-chatbot/v2.txt": "An earlier version where branches are merged and a shared helper does the repeated work.",
  "line-chatbot/v1.txt": "The first full version of the bot.",
  "line-chatbot/prototype.txt": "The first proof of concept: a LINE webhook that reads the stock sheet."
};
const wItems = Object.entries(WORK).flatMap(([chapter, files]) => files.map(f => ({ chapter, ...f, cs: chapter.split('/')[0], about: ABOUT[chapter.split('/')[0] + '/' + f.file] })));
const wId = f => f.cs + '/' + f.file;

// ---- the sidebar: same hierarchy as Main, but the chapters that have work are replaced by their real files
$('#p-main h2').textContent = 'Work';
// Work has no sub-sections and no empty chapters: a class lists its files one after another, and a class with no files is left out
let wYr = '';
$('#tree').innerHTML = notes.map(([g, ic, c, ns, yr]) => {
  const cs = slug(g);
  const items = ns.map(n => (WORK[cs + '/' + slug(n)] || []).map(f => `<li style="--c:var(--${c})"><a href="work.html#${cs}/${f.file}">${icon('code')}${esc(f.file)}</a></li>`).join('')).join('');
  if (!items) return '';
  const head = yr !== wYr ? `<p class="yr">${yr}</p>` : '';
  wYr = yr;
  return head + `<button class="grp" style="--c:var(--${c})" aria-expanded="false" data-g="${esc(g)}">${icon('caret-right')}<svg class="i f"><use href="#i-${ic}"/></svg><span>${esc(g)}</span></button><ul class="tree">${items}</ul>`;
}).join('');
(load('coder:open') || []).forEach(g => { const b = [...$$('.grp')].find(x => x.dataset.g === g); if (b) paintGroup(b, true); });

// ---- the main panel
function setHead(title, crumb) {
  document.title = title + ' · Coder';
  $('#wtab span').textContent = title;
  $('#wcrumb').textContent = crumb;
}

// cut a file into cells; the text before the first marker is the header cell
function cutCells(code, cutAt, cutLines) {
  const cells = [];
  let cur = { label: 'Header', lines: [] };
  code.split('\n').forEach((line, n) => {
    if (cutLines ? (n > 0 && cutLines.includes(n + 1)) : cutAt.test(line)) { cells.push(cur); cur = { label: line.replace(/^\s*#+\s*/, '').replace(/=+/g, '').trim(), lines: [] }; }
    cur.lines.push(line);
  });
  cells.push(cur);
  const out = cells.map(c => ({ label: c.label, code: c.lines.join('\n').replace(/\s+$/, '').replace(/^\n+/, '') }));
  if (out.length > 1 && !out[0].code.trim()) out.shift();   // nothing before the first marker, so there is no header cell
  return out;
}

async function showWork() {
  const id = decodeURIComponent(location.hash.slice(1));
  $$('#tree a.on').forEach(a => a.classList.remove('on'));
  const f = wItems.find(x => wId(x) === id);
  if (!f) {
    setHead('Work', 'Coder › Work');
    wmain.className = 'welcome';
    wmain.innerHTML = `
      <h1>Coder</h1>
      <p class="lead">Code, circuits, robots and AI, one chapter at a time</p>
      <div class="cols">
        <div>
          <section>
            <h3>Start</h3>
            <ul class="links">
              <li><a href="#" data-open="main">${icon('folder-open')}Browse notes</a></li>
              <li><a href="#" data-cmd>${icon('magnifying-glass')}Go to a chapter</a></li>
              <li><a href="#" data-group="Basic Python">${icon('terminal-window')}Open Python</a></li>
              <li><a href="#" data-group="AI Development">${icon('brain')}Open AI Development</a></li>
              <li><a href="tools.html">${icon('wrench')}Recommended tools</a></li>
            </ul>
          </section>
          <section>
            <h3>Recent</h3>
            <ul class="links" id="recent"></ul>
          </section>
        </div>
        <div>
          <section class="walk">
            <h3>Walkthroughs</h3>
            <a href="#" data-group="Basic Python">${icon('terminal-window')}<span><b>Start with Python</b>From print() up to a Tkinter app</span></a>
            <a href="#" data-group="Circuits, Arduino &amp; GPIO">${icon('cpu')}<span><b>Circuits to robots</b>Ohm's law, Arduino, ESP32, Raspberry Pi</span></a>
            <a href="#" data-group="AI Development">${icon('brain')}<span><b>AI Development</b>From AI vs ML up to LLMs</span></a>
            <a href="#" data-open="main">${icon('lightbulb')}<span><b>How notes work</b>Each chapter is one file, read top to bottom</span></a>
          </section>
        </div>
      </div>
      <div class="cols more">
        <section>
          <h3>Our Major</h3>
          <ul class="links">
            <li><a href="major.html">${icon('graduation-cap')}About the major</a><span class="dim">What it is and its classes</span></li>
            <li><a href="projects.html">${icon('cube')}Projects</a><span class="dim">What we built in class</span></li>
            <li><a href="materials.html">${icon('books')}Materials</a><span class="dim">Class files and code</span></li>
          </ul>
        </section>
        <section>
          <h3>Your data</h3>
          <p class="note">Chapters done, your notes and the chapters you opened stay in this browser. Nothing is sent anywhere. Open a chapter from <a href="#" data-open="main">Main</a> to read or write its notes.</p>
        </section>
      </div>
      <p class="startup">${icon('list-checks')}Pick a file in Main to begin</p>`;
    const recent = $('#recent');
    if (recent) recent.innerHTML = (load('coder:recent') || [])
      .map(s => all.find(x => slug(x.g) + '/' + slug(x.n) === s)).filter(Boolean)
      .map(x => `<li><a href="${href(x.g, x.n)}">${esc(x.n)}</a><span class="dim">${esc(x.g)}</span></li>`).join('');
    $$('#wmain [data-open]').forEach(a => a.onclick = e => { e.preventDefault(); open(); });
    $$('#wmain [data-group]').forEach(a => a.onclick = e => { e.preventDefault(); open(); $$('.grp').forEach(b => setGroup(b, b.dataset.g === a.dataset.group)); });
    $$('#wmain [data-cmd]').forEach(a => a.onclick = e => { e.preventDefault(); cmd.focus(); });
    return;
  }
  wmain.className = 'welcome wide wfile';
  const folder = notes.find(n => slug(n[0]) === f.cs);
  setHead(f.file, `Coder › Work › ${folder[0]} › ${f.file}`);
  const a = $(`#tree a[href="work.html#${id}"]`);
  if (a) { a.classList.add('on'); const grp = a.closest('ul').previousElementSibling; if (grp && grp.classList.contains('grp')) setGroup(grp, true); }

  const path = `work/${f.cs}/${f.file}`;
  let code = null;
  try { const r = await fetch(path); if (r.ok) code = await r.text(); } catch {}
  if (code === null) {
    wmain.innerHTML = `<h1>${esc(f.file)}</h1><p class="sum">${location.protocol === 'file:' ? 'This page reads the file from disk, so it needs to be opened through a local server such as VS Code Live Server.' : 'This file could not be loaded.'}</p>`;
    return;
  }
  code = code.replace(/\r\n?/g, '\n');
  const cells = cutCells(code, f.cutAt, f.cutLines);
  if (f.labels) cells.forEach((c, i) => { if (f.labels[i]) c.label = f.labels[i]; });   // C++ and JavaScript cells are named by hand
  let shown = f.file.split('/').pop(); if (shown.length > 26) shown = shown.replace(/\.\w+$/, '');
  const lang = f.lang || 'python', unit = lang === 'python' ? 4 : 2;
  // left: the whole file in one code window with line numbers (cells are marked bands inside it); right: the explanation of the picked cell
  // syntax-coloured lines; every run of four leading spaces gets a faint indent guide, like VS Code
  // extra colours on top of mdCode, like VS Code: names the code makes up (variables) are pink, %d / %.2f codes inside strings are orange,
  // and brackets cycle yellow, pink, blue by depth. mdCode already wrapped keywords, calls, numbers, strings and comments in spans, so only the loose text is left to colour.
  const colorize = html => {
    const stack = [], rainbow = ['br0', 'br1', 'br2'];
    let depth = 0;
    return html.split(/(<[^>]+>)/).map(part => {
      if (part[0] === '<') { if (part[1] === '/') stack.pop(); else stack.push((part.match(/class="([^"]*)"/) || [])[1] || ''); return part; }
      const top = stack[stack.length - 1];
      if (top === 's') return part.replace(/%[-+ 0#]*\d*(?:\.\d+)?[sdfrxXeEgGc]/g, m => `<span class="fc">${m}</span>`);
      if (stack.length) return part;
      return part.replace(/(&\w+;)|([A-Za-z_]\w*)|([()\[\]{}])/g, (m, ent, id, br) => {
        if (ent) return m;
        if (id) return `<span class="${id === 'self' ? 'sf' : /^(None|True|False)$/.test(id) || (lang !== 'python' && /^[A-Z][A-Z0-9_]+$/.test(id)) ? 'n' : 'v'}">${id}</span>`;
        if ('([{'.includes(br)) return `<span class="${rainbow[depth++ % 3]}">${br}</span>`;
        depth = Math.max(0, depth - 1);
        return `<span class="${rainbow[depth % 3]}">${br}</span>`;
      });
    }).join('');
  };
  // VS Code's Python grammar (MagicPython) puts float, int, str, type, list and the other built-in TYPES in their own scope (support.type), apart from built-in functions such as print and input
  const PYTYPES = /<span class="b">(bool|bytearray|bytes|classmethod|complex|dict|float|frozenset|int|list|object|property|set|slice|staticmethod|str|super|tuple|type)<\/span>/g;
  const hl = code => lang === 'python'
    ? colorize(mdCode(code, 'python').replace(PYTYPES, '<span class="ty">$1</span>').replace(/(<span class="k">def<\/span> )<span class="b">/g, '$1<span class="fn">').replace(/(<span class="k">class<\/span> )([A-Za-z_]\w*)/g, '$1<span class="y">$2</span>')).split('\n').map(l => (/\bf["']/.test(l) ? l.replace(/\{[^{}<>]*\}/g, m => `<span class="fi">${m}</span>`) : l).replace(/^( +)/, m => m.replace(/ {4}/g, '<span class="ig">    </span>'))).join('\n')
    : colorize(mdCode(code, lang)).split('\n').map(l => l.replace(/^( +)/, m => m.replace(/ {2}/g, '<span class="ig">  </span>'))).join('\n');
  let lineNo = 1;
  const segs = cells.map((c, i) => {
    const n = c.code.split('\n').length, nums = Array.from({ length: n }, (_, k) => lineNo + k).join('\n');
    lineNo += n;
    return `<section class="wseg" tabindex="0" data-i="${i}"><span class="wtag">In [${i + 1}] \u00b7 ${esc(c.label)}</span><pre class="gut">${nums}</pre><pre class="src"><code>${hl(c.code)}</code></pre></section>`;
  }).join('');
  wmain.innerHTML = `<div class="wgrid">
      <div class="wwin vs">
        <div class="vedit"><div class="wbody" id="wbody">${segs}</div></div>
      </div>
      <aside class="wside">
        <div class="wtop"><span class="ni" style="--c:var(--${folder[2]})">${icon('code')}</span><div><h1 title="${esc(f.file)}">${esc(shown)}</h1><p class="sum">${esc(f.note)}</p></div></div>
        <div class="cft" style="margin:0 0 16px;padding:0;border:0"><a class="btn ghost" href="${REPOS[f.cs].folder}" target="_blank" rel="noopener">${icon('github-logo')}<span>GitHub</span></a><button class="btn ghost" id="wcopy" type="button">${icon('notebook')}<span>Copy clone link</span></button></div>
        ${f.about ? `<p class="fabout">${esc(f.about)}</p>` : ''}
        <div class="cpanel">
          <div class="chd"><span class="ni">${icon('lightbulb')}</span><div><b>What this cell does</b><i id="cwhich"></i></div>
            <span class="cnav"><button type="button" id="cprev" data-tip="Previous cell">${icon('caret-left')}</button><button type="button" id="cnext" data-tip="Next cell">${icon('caret-right')}</button></span></div>
          <b id="ctopic"></b>
          <div id="cdoes"></div>
          <div class="cout" id="cout"></div>
          <div class="cft"><a class="btn ghost" href="${pathById(f.chapter)}">${icon('file-text')}<span>Read the chapter</span></a></div>
        </div>
      </aside>
    </div>`;

  let cur = 0;
  // code-looking words in a description (%d, print(), \\n, **) are set in code type so they stand out
  const say = t => esc(t).replace(/(%\.?\d*[dsf]|\b[\w.]+\(\)|\\n|\*\*|\bmath\.pi\b|\bTrue\b|\bFalse\b)/g, '<code>$1</code>');
  const body = $('#wbody');
  const pick = (i, scroll) => {
    cur = i;
    const all = $$('.wseg');
    all.forEach(el => el.classList.toggle('on', +el.dataset.i === i));
    $('#cdoes').innerHTML = f.does[i] ? f.does[i].split('\n\n').map(p => `<p>${say(p)}</p>`).join('') : '<p>No description yet.</p>';
    $('#cwhich').textContent = `In [${i + 1}] \u00b7 ${i + 1} of ${cells.length}`;
    $('#ctopic').textContent = cells[i].label;
    $('#cout').innerHTML = f.outs[i] ? `<span class="ocl">Output</span><pre>${esc(f.outs[i])}</pre>` : '';
    $('#cout').hidden = !f.outs[i];
    $('#cprev').disabled = i === 0;
    $('#cnext').disabled = i === cells.length - 1;
    if (scroll) body.scrollTo({ top: Math.max(0, all[i].offsetTop - 8), behavior: 'smooth' });
  };
  const flash = (btn, text) => {
    const s = btn.querySelector('span');
    if (s) { const old = s.textContent; s.textContent = text; setTimeout(() => s.textContent = old, 1400); return; }
    const old = btn.dataset.tip; btn.dataset.tip = text; setTimeout(() => btn.dataset.tip = old, 1400);
  };
  const copy = (text, btn) => (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => flash(btn, 'Copied')).catch(() => {});
  body.addEventListener('click', e => { const c = e.target.closest('.wseg'); if (c) pick(+c.dataset.i); });
  body.addEventListener('keydown', e => { const c = e.target.closest('.wseg'); if (c && e.target === c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(+c.dataset.i); } });
  $('#wcopy').onclick = () => copy(REPOS[f.cs].repo + '.git', $('#wcopy'));
  $('#cprev').onclick = () => pick(cur - 1, true);
  $('#cnext').onclick = () => pick(cur + 1, true);
  pick(0);

  $('.view').scrollTop = 0;
}

addEventListener('hashchange', showWork);
showWork();
