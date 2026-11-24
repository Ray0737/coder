// TASK: ULTRASONIC WATER LEVEL + SERVO VALVE + LCD
// HC-SR04 measures distance down to the water surface from the tank lid.
// Below 30% level -> valve opens (fill). Above 80% -> valve closes.
// Between 30-80% -> valve holds its last commanded position.
//
// WIRING — HC-SR04:
//   VCC  -> 5V
//   GND  -> GND
//   Trig -> Pin 9
//   Echo -> Pin 10   (5V-tolerant on Uno; use a resistor divider to Echo if your board is 3.3V logic)
//
// WIRING — SG90 servo:
//   Red (power)   -> 5V (external 5V supply recommended if using more than one servo)
//   Brown/Black   -> GND (shared with Arduino GND)
//   Orange/Yellow -> Pin 6
//
// WIRING — 16x2 I2C LCD (PCF8574 backpack, addr 0x27):
//   VCC -> 5V
//   GND -> GND
//   SDA -> A4 (Uno)  / SDA pin on other boards
//   SCL -> A5 (Uno)  / SCL pin on other boards

#include <Servo.h>
#include <LiquidCrystal_I2C.h>

const int trigPin = 9;
const int echoPin = 10;
const int servoPin = 6;

Servo valveServo;
LiquidCrystal_I2C lcd(0x27, 16, 2);

const float SOUND_SPEED = 0.034;      // cm per microsecond
const int TANK_HEIGHT_CM = 200;       // sensor-to-tank-bottom distance when empty
const int SERVO_OPEN_ANGLE = 90;
const int SERVO_CLOSED_ANGLE = 0;

void setup() {
  Serial.begin(9600);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  valveServo.attach(servoPin);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Tank Level Gate");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  delay(2000);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * SOUND_SPEED / 2;

  float waterLevelCm = TANK_HEIGHT_CM - distanceCm;
  float levelPercent = (waterLevelCm / TANK_HEIGHT_CM) * 100;

  if (levelPercent < 0) {
    levelPercent = 0;
  } else if (levelPercent > 100) {
    levelPercent = 100;
  }

  String valveStatus;

  if (levelPercent < 30) {
    valveServo.write(SERVO_OPEN_ANGLE);
    valveStatus = "OPEN";
  } else if (levelPercent > 80) {
    valveServo.write(SERVO_CLOSED_ANGLE);
    valveStatus = "CLOSED";
  } else {
    if (valveServo.read() == SERVO_OPEN_ANGLE) {
      valveStatus = "OPEN";
    } else {
      valveStatus = "CLOSED";
    }
  }

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Lvl: ");
  lcd.print((int)levelPercent);
  lcd.print("%");
  lcd.setCursor(0, 1);
  lcd.print("VALVE: ");
  lcd.print(valveStatus);
  delay(500);
}
