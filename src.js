// Src Code tab on the Work page (work.html#src): every source file in the two classwork repos, each linking to GitHub.
// To refresh after the repos change, update the file lists.
const showSrc = (() => {
const SRC = [
 {
  "name": "M.4-Classwork",
  "files": [
   "Code - Basic Python/Final Exam.py",
   "Code - Basic Python/Study_Planner_Program/GUI To-do List.py",
   "Code - Basic Python/Summary.py",
   "Code - Basic Python/W01.py",
   "Code - Basic Python/W02.py",
   "Code - Basic Python/W03.py",
   "Code - Basic Python/W04.py",
   "Code - Basic Python/W05.py",
   "Code - Basic Python/W06.py",
   "Code - Basic Python/W07.py",
   "Code - Basic Python/W08.py",
   "Code - Basic Python/W09.py",
   "Code - Basic Python/W10.py",
   "Code - Basic Python/W11.py",
   "Code - Line Dialogflow/Chat Final Task (1).txt",
   "Code - Line Dialogflow/Chat Final Task (2).txt",
   "Code - Line Dialogflow/Chat Final Task (3).txt",
   "Code - Line Dialogflow/Chat Final Task (4).txt",
   "Code - Line Dialogflow/Chat Final Task (5).txt",
   "Code - Line Dialogflow/Chat Final Task (MAIN).txt",
   "Code - Line Dialogflow/Chat Prototype.txt",
   "Code - Microcontroller/Task Analog Output Brightness Fade.ino",
   "Code - Microcontroller/Task Button PullUp PullDown LED Binary.ino",
   "Code - Microcontroller/Task Digital Output Active High Low.ino",
   "Code - Microcontroller/Task LDR Lux Meter.ino",
   "Code - Microcontroller/Task Ultrasonic Servo Tank Valve.ino",
   "Code - Robot/Task Circular Motion.ino",
   "Code - Robot/Task Exercise.ino",
   "Code - Robot/Task Final.ino",
   "Code - Robot/Task Star Movement.ino",
   "Code - Robot/src/Motor.cpp",
   "Code - Robot/src/Motor.h",
   "Code - Robot/src/MotorV2.h"
  ]
 },
 {
  "name": "M.5-Classwork",
  "files": [
   "Code - Computer Vision/01_Basics_IO_Drawing_Transforms/basics_and_transforms.py",
   "Code - Computer Vision/01_Basics_IO_Drawing_Transforms/reusable_cv_toolkit.py",
   "Code - Computer Vision/01_Basics_IO_Drawing_Transforms/reusable_cv_toolkit_demo.py",
   "Code - Computer Vision/02_Drawing_and_Mouse_Exercises/arrow_and_text.py",
   "Code - Computer Vision/02_Drawing_and_Mouse_Exercises/mouse_draw_ellipse.py",
   "Code - Computer Vision/02_Drawing_and_Mouse_Exercises/mouse_draw_rectangle.py",
   "Code - Computer Vision/02_Drawing_and_Mouse_Exercises/mouse_draw_triangle.py",
   "Code - Computer Vision/02_Drawing_and_Mouse_Exercises/mouse_draw_triangle_colored.py",
   "Code - Computer Vision/02_Drawing_and_Mouse_Exercises/mouse_freehand_line.py",
   "Code - Computer Vision/02_Drawing_and_Mouse_Exercises/mouse_pixel_color_picker.py",
   "Code - Computer Vision/02_Drawing_and_Mouse_Exercises/polygon_fill.py",
   "Code - Computer Vision/02_Drawing_and_Mouse_Exercises/webcam_live_overlay.py",
   "Code - Computer Vision/03_Color_and_Bitwise/binary_threshold.py",
   "Code - Computer Vision/03_Color_and_Bitwise/bitwise_shapes_demo.py",
   "Code - Computer Vision/03_Color_and_Bitwise/channel_min_max_analysis.py",
   "Code - Computer Vision/03_Color_and_Bitwise/color_range_mask_bgr.py",
   "Code - Computer Vision/03_Color_and_Bitwise/hsv_green_mask_image.py",
   "Code - Computer Vision/03_Color_and_Bitwise/hsv_multi_color_mask_image.py",
   "Code - Computer Vision/03_Color_and_Bitwise/hsv_multi_color_mask_webcam.py",
   "Code - Computer Vision/03_Color_and_Bitwise/pixel_color_picker_bgr.py",
   "Code - Computer Vision/04_Face_Detection_Haar/eye_detection_image.py",
   "Code - Computer Vision/04_Face_Detection_Haar/face_and_eye_detection_combo.py",
   "Code - Computer Vision/04_Face_Detection_Haar/face_detection_image.py",
   "Code - Computer Vision/04_Face_Detection_Haar/face_detection_webcam.py",
   "Code - Computer Vision/04_Face_Detection_Haar/face_hide_webcam.py",
   "Code - Computer Vision/04_Face_Detection_Haar/face_mask_show_only_webcam.py",
   "Code - Computer Vision/05_Face_Recognition_LBPH/step1_capture_training_faces.py",
   "Code - Computer Vision/05_Face_Recognition_LBPH/step2_train_recognizer.py",
   "Code - Computer Vision/05_Face_Recognition_LBPH/step3_recognize_live.py",
   "Code - Computer Vision/06_Hand_Tracking_Mediapipe/hand_tracking_basic_solutions_api.py",
   "Code - Computer Vision/06_Hand_Tracking_Mediapipe/hand_tracking_color_to_servo.py",
   "Code - Computer Vision/06_Hand_Tracking_Mediapipe/hand_tracking_new_tasks_api.py",
   "Code - Computer Vision/06_Hand_Tracking_Mediapipe/hand_tracking_optimized_color_sample.py",
   "Code - Computer Vision/07_YOLO_Object_Detection/train_vehicle_detector.py",
   "Code - Computer Vision/OpenCV_Summary.py",
   "Code - Computer Vision/midterm/exam1.py",
   "Code - Computer Vision/midterm/exam2.py",
   "Code - Deeplearn/MLP_train_week2.py",
   "Code - Deeplearn/activation_week3.py",
   "Code - Deeplearn/draft_train_MLP_1.py",
   "Code - Deeplearn/draft_train_MLP_2.py",
   "Code - Deeplearn/layer_week3.py",
   "Code - Raspi/calibrate_colors.py",
   "Code - Raspi/optimize_model.py",
   "Code - Raspi/setup.sh",
   "Code - Raspi/train_raspi.py",
   "Code - Raspi/w1.py",
   "Code - Raspi/w2a.py",
   "Code - Raspi/w2b.py",
   "Code - Raspi/w3a.py",
   "Code - Raspi/w3b.py",
   "Code - Raspi/w4a.py",
   "Code - Raspi/w4b.py",
   "Code - Raspi/w5a.py",
   "Code - Raspi/w5b.py",
   "Code - Raspi/w6.py",
   "Code - Raspi/w7a.py",
   "Code - Raspi/w7b.py",
   "Code - Raspi/yoyo.py",
   "Code - Raspi/yoyo2.py"
  ]
 }
];
const OWNER = 'eai-spsm';
const enc = p => p.split('/').map(encodeURIComponent).join('/');
const out = (url, html) => `<a href="${url}" target="_blank" rel="noopener">${html}</a>`;

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-clone]'); if (!b) return;
  let done = 'Copied';
  try { await navigator.clipboard.writeText(b.dataset.clone); } catch { done = 'Select and copy'; }
  b.querySelector('span').textContent = done;
  setTimeout(() => b.querySelector('span').textContent = 'Copy', 1500);
});

// everything is shown at once: one block per folder or subfolder, flowing down columns
return function () {
  const box = $('#wmain');
  box.className = 'welcome wide';
  document.title = 'Src Code · Coder';
  $('#wcrumb').textContent = 'Coder › Work › Src Code';
  $('.view').scrollTop = 0;
  box.innerHTML = '<h1>Src Code</h1><p class="lead">All the source code from the major\'s M.4 and M.5 classwork</p>' + SRC.map(r => {
    const repo = `https://github.com/${OWNER}/${r.name}`, dirs = {};
    r.files.forEach(f => { const cut = f.lastIndexOf('/'); (dirs[f.slice(0, cut)] ||= []).push([f, f.slice(cut + 1)]); });
    return `<div class="srchead"><div><h3 class="wh">${r.name.replace('-', ' ')}</h3><p class="note wide">${out(repo, `github.com/${OWNER}/${r.name}`)}</p></div><div class="clone"><code>${repo}.git</code><button type="button" data-clone="${repo}.git"><span>Copy</span></button></div></div><div class="srccols">` +
      Object.entries(dirs).map(([dir, files]) => `<section><h4>${esc(dir.replace('Code - ', '').split('/').join(' / '))}</h4><ul class="links">` +
        files.map(([f, name]) => `<li>${out(`${repo}/blob/main/${enc(f)}`, icon('file-text') + esc(name))}</li>`).join('') + '</ul></section>').join('') + '</div>';
  }).join('');
};
})();
