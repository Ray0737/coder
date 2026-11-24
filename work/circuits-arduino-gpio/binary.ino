// TASK: BUTTON INPUT — PULL-UP vs PULL-DOWN, DRIVING A 4-BIT LED BINARY COUNTER
//
// Button A: wired to GND, uses INPUT_PULLUP (internal resistor) -> idle = HIGH, pressed = LOW
// Button B: wired to 5V through an external pull-DOWN resistor  -> idle = LOW,  pressed = HIGH
// Either button increments a 4-bit counter (0-15) shown in binary on 4 LEDs.
//
// WIRING — Button A (internal pull-up):
//   Pin 2 -> one leg of button -> other leg of button -> GND
//   (no external resistor needed; INPUT_PULLUP enables the internal one)
//
// WIRING — Button B (external pull-down):
//   5V -> one leg of button -> other leg of button -> Pin 3
//   Pin 3 -> 10kohm resistor -> GND
//   (resistor holds the pin LOW when button is not pressed)
//
// WIRING — LED binary display (x4, same pattern):
//   Pin 8  (BIT0/LSB) -> 220ohm resistor -> LED anode(+) -> LED cathode(-) -> GND
//   Pin 9  (BIT1)     -> 220ohm resistor -> LED anode(+) -> LED cathode(-) -> GND
//   Pin 10 (BIT2)     -> 220ohm resistor -> LED anode(+) -> LED cathode(-) -> GND
//   Pin 11 (BIT3/MSB) -> 220ohm resistor -> LED anode(+) -> LED cathode(-) -> GND

#define BUTTON_PULLUP   2  // internal pull-up, active LOW when pressed
#define BUTTON_PULLDOWN 3  // external pull-down resistor, active HIGH when pressed

#define LED_BIT0 8   // LSB
#define LED_BIT1 9
#define LED_BIT2 10
#define LED_BIT3 11  // MSB

const unsigned long DEBOUNCE_MS = 50;

int counter = 0;
bool lastPullUpState = HIGH;    // idle state for INPUT_PULLUP
bool lastPullDownState = LOW;   // idle state for external pull-down
unsigned long lastDebounceTime = 0;

void setup() {
  pinMode(BUTTON_PULLUP, INPUT_PULLUP);
  pinMode(BUTTON_PULLDOWN, INPUT);  // external resistor does the pull-down

  pinMode(LED_BIT0, OUTPUT);
  pinMode(LED_BIT1, OUTPUT);
  pinMode(LED_BIT2, OUTPUT);
  pinMode(LED_BIT3, OUTPUT);

  showBinary(counter);
}

void loop() {
  bool pullUpState = digitalRead(BUTTON_PULLUP);
  bool pullDownState = digitalRead(BUTTON_PULLDOWN);

  unsigned long now = millis();
  if (now - lastDebounceTime > DEBOUNCE_MS) {
    // Pull-up button: pressed when it goes LOW
    if (pullUpState == LOW && lastPullUpState == HIGH) {
      counter = (counter + 1) % 16;
      showBinary(counter);
      lastDebounceTime = now;
    }

    // Pull-down button: pressed when it goes HIGH
    if (pullDownState == HIGH && lastPullDownState == LOW) {
      counter = (counter + 1) % 16;
      showBinary(counter);
      lastDebounceTime = now;
    }
  }

  lastPullUpState = pullUpState;
  lastPullDownState = pullDownState;
}

void showBinary(int value) {
  digitalWrite(LED_BIT0, (value >> 0) & 1);
  digitalWrite(LED_BIT1, (value >> 1) & 1);
  digitalWrite(LED_BIT2, (value >> 2) & 1);
  digitalWrite(LED_BIT3, (value >> 3) & 1);
}
