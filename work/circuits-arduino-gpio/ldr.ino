// TASK: LDR + FIXED RESISTOR VOLTAGE DIVIDER -> LUX METER ON LCD
// LDR wired as a voltage divider with Rref (4.7k) to 5V, LDR to GND, node -> A0.
// Resistance is derived from the divider reading, then converted to an
// approximate lux value using the LDR's datasheet resistance/light curve
// (RL10 = resistance in kOhm at 10 lux, GAMMA = curve slope).
//
// WIRING — LDR voltage divider:
//   5V -> 4.7kohm resistor (Rref) -> [node] -> LDR -> GND
//   [node] -> Pin A0
//   (order matters: swap Rref and LDR and the lux math reads backwards)
//
// WIRING — 16x2 I2C LCD (PCF8574 backpack, addr 0x27):
//   VCC -> 5V
//   GND -> GND
//   SDA -> A4 (Uno)  / SDA pin on other boards
//   SCL -> A5 (Uno)  / SCL pin on other boards

#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

const int LDR_PIN = A0;

const float Rref = 4.7;    // kOhm, fixed resistor in the divider
const float RL10 = 50.0;   // kOhm, LDR resistance at 10 lux (from datasheet)
const float GAMMA = 0.7;   // LDR resistance/light curve slope

void setup() {
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Light Sensor");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  delay(2000);
}

void loop() {
  int analogValue = analogRead(LDR_PIN);
  if (analogValue < 1) analogValue = 1;  // avoid divide-by-zero in Vout below
  float Vout = (float)analogValue * (5.0 / 1023.0);

  // R = Rref * (Vin/Vout - 1), Vin = 5V
  float R = Rref * (5.0 / Vout - 1.0);

  // lux = (RL10 * 1000 * 10^GAMMA / R)^(1/GAMMA), R in ohms
  float lux = pow(RL10 * 1000.0 * pow(10.0, GAMMA) / (R * 1000.0), 1.0 / GAMMA);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Brightness:");
  lcd.setCursor(0, 1);
  lcd.print(lux, 0);
  lcd.print(" lux");

  delay(1000);
}
