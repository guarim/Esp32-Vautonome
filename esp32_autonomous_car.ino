/*
 * Voiture Autonome ESP32
 * Contrôle via Bluetooth Low Energy (BLE)
 * Pilotage de 2 moteurs CC avec L298N
 * 
 * Connexions:
 * L298N Motor Driver:
 *   - IN1 -> GPIO 27 (Moteur Gauche)
 *   - IN2 -> GPIO 26 (Moteur Gauche)
 *   - IN3 -> GPIO 25 (Moteur Droit)
 *   - IN4 -> GPIO 33 (Moteur Droit)
 *   - ENA -> GPIO 14 (PWM Moteur Gauche)
 *   - ENB -> GPIO 12 (PWM Moteur Droit)
 * 
 * Capteur Ultrason HC-SR04:
 *   - TRIG -> GPIO 5
 *   - ECHO -> GPIO 18
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// UUIDs pour le service BLE
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// Pins des moteurs
#define MOTOR_LEFT_IN1    27
#define MOTOR_LEFT_IN2    26
#define MOTOR_RIGHT_IN3   25
#define MOTOR_RIGHT_IN4   33
#define MOTOR_LEFT_EN     14
#define MOTOR_RIGHT_EN    12

// Pins du capteur ultrason
#define TRIG_PIN          5
#define ECHO_PIN          18

// Paramètres PWM
#define PWM_FREQ          1000
#define PWM_RESOLUTION    8
#define PWM_CHANNEL_LEFT  0
#define PWM_CHANNEL_RIGHT 1

// Variables globales
BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

int currentSpeed = 0;
String currentCommand = "STOP";
unsigned long lastCommandTime = 0;
const unsigned long COMMAND_TIMEOUT = 500; // ms

// Callbacks BLE
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
        Serial.println("Client connecté");
    };

    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
        Serial.println("Client déconnecté");
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
        std::string value = pCharacteristic->getValue();

        if (value.length() > 0) {
            String command = String(value.c_str());
            Serial.println("Commande reçue: " + command);
            processCommand(command);
            lastCommandTime = millis();
        }
    }
};

void setup() {
    Serial.begin(115200);
    Serial.println("Initialisation de la voiture autonome ESP32...");

    // Configuration des pins moteurs
    pinMode(MOTOR_LEFT_IN1, OUTPUT);
    pinMode(MOTOR_LEFT_IN2, OUTPUT);
    pinMode(MOTOR_RIGHT_IN3, OUTPUT);
    pinMode(MOTOR_RIGHT_IN4, OUTPUT);

    // Configuration PWM
    ledcSetup(PWM_CHANNEL_LEFT, PWM_FREQ, PWM_RESOLUTION);
    ledcSetup(PWM_CHANNEL_RIGHT, PWM_FREQ, PWM_RESOLUTION);
    ledcAttachPin(MOTOR_LEFT_EN, PWM_CHANNEL_LEFT);
    ledcAttachPin(MOTOR_RIGHT_EN, PWM_CHANNEL_RIGHT);

    // Configuration capteur ultrason
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);

    // Initialisation BLE
    BLEDevice::init("ESP32_AutoCar");
    
    // Créer le serveur BLE
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());

    // Créer le service BLE
    BLEService *pService = pServer->createService(SERVICE_UUID);

    // Créer la caractéristique BLE
    pCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_WRITE |
        BLECharacteristic::PROPERTY_NOTIFY
    );

    pCharacteristic->setCallbacks(new MyCallbacks());
    pCharacteristic->addDescriptor(new BLE2902());

    // Démarrer le service
    pService->start();

    // Démarrer l'advertising
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(false);
    pAdvertising->setMinPreferred(0x0);
    BLEDevice::startAdvertising();

    Serial.println("ESP32 prêt ! En attente de connexion BLE...");
    
    // Arrêter les moteurs
    stopMotors();
}

void loop() {
    // Gestion de la connexion BLE
    if (!deviceConnected && oldDeviceConnected) {
        delay(500);
        pServer->startAdvertising();
        Serial.println("Redémarrage de l'advertising");
        oldDeviceConnected = deviceConnected;
        stopMotors();
    }
    
    if (deviceConnected && !oldDeviceConnected) {
        oldDeviceConnected = deviceConnected;
    }

    // Timeout de sécurité
    if (millis() - lastCommandTime > COMMAND_TIMEOUT && currentCommand != "STOP") {
        Serial.println("Timeout - Arrêt de sécurité");
        stopMotors();
        currentCommand = "STOP";
    }

    // Mesure de distance (pour information)
    static unsigned long lastDistanceCheck = 0;
    if (millis() - lastDistanceCheck > 200) {
        long distance = measureDistance();
        if (distance > 0 && distance < 20 && currentCommand != "STOP") {
            Serial.println("Obstacle détecté à " + String(distance) + "cm - Arrêt");
            stopMotors();
        }
        lastDistanceCheck = millis();
    }

    delay(10);
}

void processCommand(String command) {
    // Format: "COMMAND:VALUE"
    int separatorIndex = command.indexOf(':');
    String cmd = command;
    int value = 0;

    if (separatorIndex > 0) {
        cmd = command.substring(0, separatorIndex);
        value = command.substring(separatorIndex + 1).toInt();
    }

    // Mapper la valeur 0-100 vers 0-255 pour PWM
    int pwmValue = map(constrain(value, 0, 100), 0, 100, 0, 255);
    currentSpeed = pwmValue;
    currentCommand = cmd;

    Serial.println("Commande: " + cmd + " | Vitesse: " + String(value) + "% | PWM: " + String(pwmValue));

    if (cmd == "FORWARD") {
        moveForward(pwmValue);
    } else if (cmd == "BACKWARD") {
        moveBackward(pwmValue);
    } else if (cmd == "LEFT") {
        turnLeft(pwmValue);
    } else if (cmd == "RIGHT") {
        turnRight(pwmValue);
    } else if (cmd == "STOP") {
        stopMotors();
    } else {
        Serial.println("Commande inconnue: " + cmd);
    }
}

void moveForward(int speed) {
    Serial.println("Avancer - Vitesse: " + String(speed));
    
    // Moteur gauche - Avancer
    digitalWrite(MOTOR_LEFT_IN1, HIGH);
    digitalWrite(MOTOR_LEFT_IN2, LOW);
    ledcWrite(PWM_CHANNEL_LEFT, speed);
    
    // Moteur droit - Avancer
    digitalWrite(MOTOR_RIGHT_IN3, HIGH);
    digitalWrite(MOTOR_RIGHT_IN4, LOW);
    ledcWrite(PWM_CHANNEL_RIGHT, speed);
}

void moveBackward(int speed) {
    Serial.println("Reculer - Vitesse: " + String(speed));
    
    // Moteur gauche - Reculer
    digitalWrite(MOTOR_LEFT_IN1, LOW);
    digitalWrite(MOTOR_LEFT_IN2, HIGH);
    ledcWrite(PWM_CHANNEL_LEFT, speed);
    
    // Moteur droit - Reculer
    digitalWrite(MOTOR_RIGHT_IN3, LOW);
    digitalWrite(MOTOR_RIGHT_IN4, HIGH);
    ledcWrite(PWM_CHANNEL_RIGHT, speed);
}

void turnLeft(int speed) {
    Serial.println("Tourner à gauche - Vitesse: " + String(speed));
    
    // Moteur gauche - Ralentir ou arrêter
    digitalWrite(MOTOR_LEFT_IN1, HIGH);
    digitalWrite(MOTOR_LEFT_IN2, LOW);
    ledcWrite(PWM_CHANNEL_LEFT, speed / 2);
    
    // Moteur droit - Vitesse normale
    digitalWrite(MOTOR_RIGHT_IN3, HIGH);
    digitalWrite(MOTOR_RIGHT_IN4, LOW);
    ledcWrite(PWM_CHANNEL_RIGHT, speed);
}

void turnRight(int speed) {
    Serial.println("Tourner à droite - Vitesse: " + String(speed));
    
    // Moteur gauche - Vitesse normale
    digitalWrite(MOTOR_LEFT_IN1, HIGH);
    digitalWrite(MOTOR_LEFT_IN2, LOW);
    ledcWrite(PWM_CHANNEL_LEFT, speed);
    
    // Moteur droit - Ralentir ou arrêter
    digitalWrite(MOTOR_RIGHT_IN3, HIGH);
    digitalWrite(MOTOR_RIGHT_IN4, LOW);
    ledcWrite(PWM_CHANNEL_RIGHT, speed / 2);
}

void stopMotors() {
    Serial.println("Arrêt des moteurs");
    
    // Arrêter les deux moteurs
    digitalWrite(MOTOR_LEFT_IN1, LOW);
    digitalWrite(MOTOR_LEFT_IN2, LOW);
    digitalWrite(MOTOR_RIGHT_IN3, LOW);
    digitalWrite(MOTOR_RIGHT_IN4, LOW);
    
    ledcWrite(PWM_CHANNEL_LEFT, 0);
    ledcWrite(PWM_CHANNEL_RIGHT, 0);
    
    currentSpeed = 0;
}

long measureDistance() {
    // Envoyer une impulsion ultrason
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    
    // Mesurer le temps de retour
    long duration = pulseIn(ECHO_PIN, HIGH, 30000); // Timeout 30ms
    
    // Calculer la distance en cm
    long distance = duration * 0.034 / 2;
    
    // Filtrer les valeurs invalides
    if (distance > 400 || distance <= 0) {
        return -1;
    }
    
    return distance;
}
