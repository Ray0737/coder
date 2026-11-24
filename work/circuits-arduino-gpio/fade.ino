// TASK: ANALOG OUTPUT — PWM BRIGHTNESS FADE (0-255)
// 3 LEDs on PWM-capable pins, each fades up then down in sequence,
// demonstrating analogWrite() as a "virtual" analog voltage via PWM.
//
// WIRING (same pattern x3, one per LED):
//   Pin 9  (LED_1) -> 220ohm resistor -> LED anode(+) -> LED cathode(-) -> GND
//   Pin 10 (LED_2) -> 220ohm resistor -> LED anode(+) -> LED cathode(-) -> GND
//   Pin 11 (LED_3) -> 220ohm resistor -> LED anode(+) -> LED cathode(-) -> GND
//   Pins must be PWM-capable (marked ~ on an Uno: 3, 5, 6, 9, 10, 11).

#define LED_1 9   // must be a ~PWM pin
#define LED_2 10  // must be a ~PWM pin
#define LED_3 11  // must be a ~PWM pin

void setup() {
  pinMode(LED_1, OUTPUT);
  pinMode(LED_2, OUTPUT);
  pinMode(LED_3, OUTPUT);
}

void loop() {
  // --- LED_1 fade up then down ---
  for (int i = 0; i <= 255; i++) {
    analogWrite(LED_1, i);
    delay(5);
  }
  for (int i = 255; i >= 0; i--) {
    analogWrite(LED_1, i);
    delay(5);
  }
  delay(1000);

  // --- LED_2 fade up then down ---
  for (int i = 0; i <= 255; i++) {
    analogWrite(LED_2, i);
    delay(5);
  }
  for (int i = 255; i >= 0; i--) {
    analogWrite(LED_2, i);
    delay(5);
  }
  delay(1000);

  // --- LED_3 fade up then down ---
  for (int i = 0; i <= 255; i++) {
    analogWrite(LED_3, i);
    delay(5);
  }
  for (int i = 255; i >= 0; i--) {
    analogWrite(LED_3, i);
    delay(5);
  }
  delay(1000);

  // --- All three cross-fade together ---
  for (int i = 0; i <= 255; i++) {
    analogWrite(LED_1, i);
    analogWrite(LED_2, 255 - i);
    analogWrite(LED_3, i);
    delay(5);
  }
  for (int i = 255; i >= 0; i--) {
    analogWrite(LED_1, i);
    analogWrite(LED_2, 255 - i);
    analogWrite(LED_3, i);
    delay(5);
  }
  delay(1000);
}
