# Configuration et Déploiement

## 📦 Dépendances

### Matériel
```
ESP32:
- ESP32 DevKit V1 ou compatible (30-pin)
- Tension: 3.3V (logique) / 5V (alimentation USB)
- Bluetooth: BLE 4.2+
- WiFi: 802.11 b/g/n (non utilisé dans ce projet)

L298N Motor Driver:
- Tension moteur: 5V-35V
- Courant max: 2A par canal
- Contrôle: 4 GPIO + 2 PWM

Moteurs CC:
- Tension: 6V-12V
- Réducteur: recommandé (1:48 ou 1:120)
- Encodeurs: optionnels

HC-SR04 (optionnel):
- Portée: 2cm - 400cm
- Précision: ±3mm
- Tension: 5V

Alimentation:
- Batterie moteurs: 7.4V (2S LiPo) ou 9V-12V
- ESP32: 5V via USB ou régulateur
- Consommation totale: ~2A en charge
```

### Logiciels
```
Arduino IDE:
- Version: 1.8.19+ ou 2.x
- Board Manager: esp32 by Espressif (2.0.0+)
- Bibliothèques: BLE intégré

Smartphone:
- Android: 6.0+ (API 23+)
- Chrome: 90+
- Support BLE: Requis
- RAM: 2GB+ recommandé
```

### Web
```html
<!-- Aucune bibliothèque externe requise -->
<!-- Tout est en JavaScript natif -->

<!-- APIs utilisées: -->
- Web Bluetooth API
- MediaDevices API (getUserMedia)
- Canvas API
- Geolocation API (futur)
```

## 🌐 Déploiement Web

### Option 1: Serveur Local (Développement)

#### Python Simple Server
```bash
# Python 3
cd /chemin/vers/projet
python -m http.server 8000

# Accès:
# http://localhost:8000/autonomous_car.html
```

#### Node.js http-server
```bash
npm install -g http-server
http-server -p 8000

# Accès:
# http://localhost:8000/autonomous_car.html
```

#### Live Server (VS Code)
```
1. Installer l'extension "Live Server"
2. Clic droit sur autonomous_car.html
3. "Open with Live Server"
```

### Option 2: HTTPS (Production)

**⚠️ IMPORTANT**: Web Bluetooth et getUserMedia nécessitent HTTPS!

#### Netlify (Gratuit)
```bash
# 1. Créer compte sur netlify.com
# 2. Installer Netlify CLI
npm install -g netlify-cli

# 3. Déployer
cd /chemin/vers/projet
netlify deploy --prod

# L'URL HTTPS sera générée automatiquement
```

#### GitHub Pages
```bash
# 1. Créer un repo GitHub
git init
git add autonomous_car.html autonomous_car.js README.md
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/autonomous-car.git
git push -u origin main

# 2. Activer GitHub Pages dans les settings
# Settings → Pages → Source: main branch

# Accès:
# https://username.github.io/autonomous-car/autonomous_car.html
```

#### Vercel
```bash
npm install -g vercel
cd /chemin/vers/projet
vercel

# Suivre les instructions
```

### Option 3: Serveur HTTPS Local

#### mkcert (Certificat local)
```bash
# Installer mkcert
# macOS
brew install mkcert
mkcert -install

# Windows (Chocolatey)
choco install mkcert
mkcert -install

# Linux
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
mkcert -install

# Créer certificats
cd /chemin/vers/projet
mkcert localhost 127.0.0.1 ::1 [VOTRE-IP-LOCAL]

# Démarrer serveur HTTPS
# Créer server.js:
```

```javascript
// server.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const options = {
  key: fs.readFileSync('localhost+3-key.pem'),
  cert: fs.readFileSync('localhost+3.pem')
};

https.createServer(options, (req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './autonomous_car.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}).listen(8443);

console.log('Server running at https://localhost:8443/');
```

```bash
node server.js
# Accès: https://localhost:8443/
```

## 📱 Configuration Smartphone

### Permissions Requises
```
Android manifest (si app native):
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### Chrome Flags (si problèmes)
```
chrome://flags

Activer:
✓ Experimental Web Platform features
✓ Web Bluetooth API

Redémarrer Chrome
```

### Paramètres Android
```
1. Paramètres → Applications
2. Chrome → Permissions
3. Activer:
   - Caméra
   - Bluetooth
   - Localisation (pour BLE scan)
```

## 🔧 Configuration ESP32

### Arduino IDE Setup
```
1. Fichier → Préférences
2. URLs de gestionnaire de cartes additionnelles:
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

3. Outils → Type de carte → Gestionnaire de cartes
4. Installer "esp32 by Espressif Systems"

5. Outils → Type de carte → ESP32 Arduino
6. Sélectionner: "ESP32 Dev Module"
```

### Configuration Détaillée
```
Board: ESP32 Dev Module
Upload Speed: 921600
CPU Frequency: 240MHz
Flash Frequency: 80MHz
Flash Mode: QIO
Flash Size: 4MB (32Mb)
Partition Scheme: Default 4MB with spiffs
Core Debug Level: None
PSRAM: Disabled
```

### Upload Troubleshooting
```
Si échec de téléversement:

1. Maintenir bouton BOOT pendant upload
2. Essayer vitesse 115200
3. Vérifier driver USB (CP2102/CH340)
4. Tester autre port USB
5. Vérifier câble USB (données, pas charge seule)
```

## 🔌 Connexions Physiques

### Schéma Détaillé
```
ESP32 → L298N:
  GPIO27 → IN1 (gauche avant)
  GPIO26 → IN2 (gauche arrière)
  GPIO25 → IN3 (droit avant)
  GPIO33 → IN4 (droit arrière)
  GPIO14 → ENA (PWM gauche)
  GPIO12 → ENB (PWM droit)
  GND    → GND

L298N → Moteurs:
  OUT1 → Moteur Gauche (+)
  OUT2 → Moteur Gauche (-)
  OUT3 → Moteur Droit (+)
  OUT4 → Moteur Droit (-)

L298N Alimentation:
  +12V → Batterie (+)
  GND  → Batterie (-) + ESP32 GND
  +5V  → ESP32 VIN (si jumper 5V enlevé)

HC-SR04 → ESP32:
  VCC  → 5V
  TRIG → GPIO5
  ECHO → GPIO18
  GND  → GND
```

### Notes Importantes
```
⚠️ Alimentation:
- NE PAS alimenter moteurs et ESP32 par USB simultanément
- Toujours connecter GND commun
- Vérifier polarité batterie

⚠️ L298N:
- Jumper 5V: ENLEVER si batterie >12V
- Jumper ENA/ENB: ENLEVER pour PWM
- Dissipateur: REQUIS si courant >1A

⚠️ Moteurs:
- Vérifier tension nominale
- Tester sens rotation avant montage
- Inverser OUT1/OUT2 si sens incorrect
```

## 📊 Tests Unitaires

### Test ESP32
```cpp
// Test moteurs individuels
void testMotors() {
  Serial.println("Test Moteur Gauche...");
  digitalWrite(MOTOR_LEFT_IN1, HIGH);
  digitalWrite(MOTOR_LEFT_IN2, LOW);
  ledcWrite(PWM_CHANNEL_LEFT, 128);
  delay(2000);
  stopMotors();
  
  Serial.println("Test Moteur Droit...");
  digitalWrite(MOTOR_RIGHT_IN3, HIGH);
  digitalWrite(MOTOR_RIGHT_IN4, LOW);
  ledcWrite(PWM_CHANNEL_RIGHT, 128);
  delay(2000);
  stopMotors();
}

// Appeler dans setup() pour tester
```

### Test BLE
```javascript
// Console navigateur
navigator.bluetooth.requestDevice({
  acceptAllDevices: true,
  optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
})
.then(device => console.log('Trouvé:', device.name))
.catch(error => console.error('Erreur:', error));
```

### Test Caméra
```javascript
// Console navigateur
navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: 'environment' } 
})
.then(stream => {
  console.log('Caméra OK:', stream.getVideoTracks());
  stream.getTracks().forEach(track => track.stop());
})
.catch(error => console.error('Erreur caméra:', error));
```

## 🐛 Debug

### Serial Monitor ESP32
```
Baud: 115200
Messages attendus:
  "Initialisation..."
  "ESP32 prêt !"
  "Client connecté"
  "Commande reçue: FORWARD:50"
```

### Console JavaScript
```javascript
// F12 dans Chrome
// Onglet Console

// Activer logs détaillés
localStorage.setItem('debug', 'true');

// Messages attendus:
// "Système prêt"
// "Connecté à ESP32_AutoCar"
// "Commande envoyée: FORWARD:50"
```

### Outils
```
- Arduino Serial Monitor: Debug ESP32
- Chrome DevTools: Debug JavaScript/BLE
- Multimètre: Vérifier tensions
- Oscilloscope: Analyser PWM (optionnel)
```

## 📈 Optimisations

### Performance
```javascript
// Réduire charge CPU
CONFIG.detectionInterval = 200; // 100ms → 200ms

// Réduire résolution vidéo
const constraints = {
  video: {
    width: { ideal: 320 },  // 640 → 320
    height: { ideal: 240 }  // 480 → 240
  }
};
```

### Batterie
```cpp
// Réduire consommation
#define PWM_FREQ 500  // 1000Hz → 500Hz

// Mode veille si inactif
if (millis() - lastCommandTime > 60000) {
  esp_sleep_enable_timer_wakeup(60 * 1000000);
  esp_light_sleep_start();
}
```

## 📚 Références

### Standards
- [Bluetooth SIG](https://www.bluetooth.com/)
- [W3C Web Bluetooth](https://webbluetoothcg.github.io/web-bluetooth/)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

### Communautés
- [ESP32 Forum](https://esp32.com/)
- [Arduino Forum](https://forum.arduino.cc/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/esp32)

---

**Date de mise à jour**: 2025-02
**Version**: 1.0.0
