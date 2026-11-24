// TASK: DIGITAL OUTPUT — ACTIVE HIGH vs ACTIVE LOW
// L1/L2 are wired ACTIVE HIGH  -> LED lights when pin = HIGH
// R1/R2 are wired ACTIVE LOW   -> LED lights when pin = LOW
// (matches a dual H-bridge / relay board where one side of the
//  driver inverts logic — very common on cheap motor driver boards)
//
// WIRING (active-high side, L1/L2):
//   Pin 6 (L2) -> 220ohm resistor -> LED anode(+) -> LED cathode(-) -> GND
//   Pin 7 (L1) -> 220ohm resistor -> LED anode(+) -> LED cathode(-) -> GND
//   (pin HIGH pushes current through the LED -> lights up)
//
// WIRING (active-low side, R1/R2):
//   5V -> LED anode(+) -> LED cathode(-) -> 220ohm resistor -> Pin 8 (R1)
//   5V -> LED anode(+) -> LED cathode(-) -> 220ohm resistor -> Pin 9 (R2)
//   (pin LOW sinks current through the LED -> lights up; pin HIGH = no current = off)

#define L2 6  // Active HIGH
#define L1 7  // Active HIGH
#define R1 8  // Active LOW
#define R2 9  // Active LOW

void setup() {
  pinMode(L2, OUTPUT);
  pinMode(L1, OUTPUT);
  pinMode(R1, OUTPUT);
  pinMode(R2, OUTPUT);
}

void loop() {
  // --- Step 1: L side ON (active-high -> HIGH), R side OFF (active-low -> HIGH) ---
  digitalWrite(L2, HIGH);
  digitalWrite(L1, HIGH);
  digitalWrite(R1, HIGH);
  digitalWrite(R2, HIGH);
  delay(500);

  // --- Step 2: L side OFF (active-high -> LOW), R side ON (active-low -> LOW) ---
  digitalWrite(L2, LOW);
  digitalWrite(L1, LOW);
  digitalWrite(R1, LOW);
  digitalWrite(R2, LOW);
  delay(500);

  // --- Step 3: L2 + R1 ON, L1 + R2 OFF (alternating diagonal pattern) ---
  digitalWrite(L2, HIGH);
  digitalWrite(L1, LOW);
  digitalWrite(R1, LOW);
  digitalWrite(R2, HIGH);
  delay(500);

  // --- Step 4: everything OFF, longer pause before repeating ---
  digitalWrite(L2, LOW);
  digitalWrite(L1, LOW);
  digitalWrite(R1, HIGH);
  digitalWrite(R2, HIGH);
  delay(1000);
}
