# Système de Voiture Autonome ESP32

## 📋 Description du Projet

Système complet de voiture autonome contrôlée par smartphone Android via Bluetooth Low Energy (BLE). Le système utilise la caméra du smartphone pour :
- Détecter et suivre des lignes de couleurs multiples
- Reconnaître les panneaux de circulation courants
- Détecter les obstacles et maintenir une distance de sécurité
- Contrôler deux moteurs CC via un module L298N

## 🎯 Fonctionnalités

### Vision par Ordinateur
- ✅ Détection de lignes (blanc, noir, rouge, vert, jaune, bleu)
- ✅ Sélection multiple de couleurs à suivre
- ✅ Détection de panneaux STOP
- ✅ Détection de feux de circulation
- ✅ Détection d'obstacles
- ✅ Estimation de distance
- ✅ Visualisation en temps réel

### Contrôle Moteur
- ✅ Avancer / Reculer
- ✅ Tourner gauche / droite
- ✅ Contrôle de vitesse PWM
- ✅ Arrêt d'urgence
- ✅ Arrêt automatique si STOP détecté (2 secondes)
- ✅ Maintien de distance de sécurité (configurable)

### Interface Utilisateur
- ✅ Design moderne et responsive
- ✅ Affichage vidéo en temps réel
- ✅ Sélection interactive des couleurs
- ✅ Contrôles manuels
- ✅ Informations d'environnement
- ✅ Journal des événements
- ✅ Statistiques en temps réel

## 🔧 Matériel Requis

### ESP32
- 1x ESP32 DevKit V1 (ou compatible)
- 1x Module L298N (contrôleur moteur)
- 2x Moteurs CC avec réducteur
- 1x Capteur ultrason HC-SR04 (optionnel)
- 1x Batterie 7.4V-12V (pour moteurs)
- 1x Powerbank 5V (pour ESP32)
- Câbles de connexion

### Smartphone
- Android avec support BLE
- Caméra fonctionnelle
- Navigateur moderne (Chrome recommandé)

## 📐 Schéma de Connexion

```
ESP32 Pinout:
├─ GPIO 27 → L298N IN1 (Moteur Gauche)
├─ GPIO 26 → L298N IN2 (Moteur Gauche)
├─ GPIO 25 → L298N IN3 (Moteur Droit)
├─ GPIO 33 → L298N IN4 (Moteur Droit)
├─ GPIO 14 → L298N ENA (PWM Gauche)
├─ GPIO 12 → L298N ENB (PWM Droit)
├─ GPIO 5  → HC-SR04 TRIG
└─ GPIO 18 → HC-SR04 ECHO

L298N Connections:
├─ IN1, IN2, IN3, IN4 → ESP32 (voir ci-dessus)
├─ ENA, ENB → ESP32 PWM
├─ OUT1, OUT2 → Moteur Gauche
├─ OUT3, OUT4 → Moteur Droit
├─ 12V → Batterie moteurs
└─ 5V → ESP32 (ou alimentation séparée)

Alimentation:
├─ ESP32: 5V via USB ou régulateur
└─ Moteurs: 7.4V-12V via L298N
```

## 🚀 Installation

### 1. Configuration ESP32

#### Installer les bibliothèques Arduino
```cpp
// Dans Arduino IDE:
// Outils → Gérer les bibliothèques → Installer:
- ESP32 BLE Arduino (inclus dans le package ESP32)
```

#### Charger le code
1. Ouvrir `esp32_autonomous_car.ino` dans Arduino IDE
2. Sélectionner la carte: **ESP32 Dev Module**
3. Sélectionner le port COM approprié
4. Téléverser le code

#### Vérification
```
Serial Monitor (115200 baud):
✓ "Initialisation de la voiture autonome ESP32..."
✓ "ESP32 prêt ! En attente de connexion BLE..."
```

### 2. Configuration Smartphone

#### Déployer l'interface Web
```bash
# Option 1: Serveur local (développement)
python -m http.server 8000
# Puis ouvrir: http://localhost:8000/autonomous_car.html

# Option 2: Hébergement en ligne
# Héberger autonomous_car.html et autonomous_car.js sur un serveur HTTPS
# (Requis pour accès caméra et BLE)
```

#### Accès depuis le smartphone
1. Ouvrir Chrome sur Android
2. Naviguer vers l'URL du serveur
3. Autoriser l'accès à la caméra et au Bluetooth

## 📱 Utilisation

### Démarrage
1. **Alimenter l'ESP32** et les moteurs
2. **Ouvrir la page web** sur le smartphone
3. **Cliquer "Connecter ESP32"** → Sélectionner "ESP32_AutoCar"
4. **Cliquer "Démarrer Caméra"** → Autoriser l'accès
5. **Sélectionner les couleurs** de ligne à suivre
6. **Cliquer "Activer Détection"** pour le mode autonome

### Modes de Fonctionnement

#### Mode Autonome
- Active la détection automatique
- Suit les lignes de couleur sélectionnées
- Réagit aux panneaux et obstacles
- Ajuste automatiquement la vitesse et direction

#### Mode Manuel
- Utiliser les boutons directionnels
- Ajuster la vitesse avec le slider
- Contrôle direct sans détection

### Configuration des Paramètres

#### Couleurs de Ligne
```
☑ Blanc  - Lignes blanches (routes)
☐ Noir   - Lignes noires (circuits)
☐ Rouge  - Lignes rouges personnalisées
☐ Vert   - Lignes vertes personnalisées
☐ Jaune  - Lignes jaunes personnalisées
☐ Bleu   - Lignes bleues personnalisées
```

#### Paramètres de Détection
- **Seuil de Détection**: 0-100% (sensibilité)
- **Distance de Sécurité**: 10-50 cm (arrêt automatique)
- **Vitesse Manuelle**: 0-100% (contrôle direct)

## 🔍 Détection des Panneaux

### Panneaux Supportés
- **STOP** ⛔: Arrêt pendant 2 secondes puis reprise
- **Feu Rouge** 🔴: Arrêt jusqu'à détection du vert
- **Feu Vert** 🟢: Autorisation de passage

### Algorithme de Détection
```javascript
1. Analyse de la partie haute de l'image
2. Recherche de zones rouges/vertes concentrées
3. Validation par seuil de confiance
4. Envoi de commande appropriée à l'ESP32
```

## 📊 Informations Affichées

### Environnement
- **Vitesse actuelle** (km/h estimé)
- **Direction** (⬆️ ⬇️ ⬅️ ➡️)
- **Distance obstacle** (cm)
- **État moteur** (▶️ ⏸️ 🛑)

### Statut Système
- Connexion BLE (✅/❌)
- État caméra (Active/Inactive)
- État détection (Active/Inactive)
- Compteur de commandes

### Journal Événements
- Connexions/Déconnexions
- Commandes envoyées
- Détections effectuées
- Erreurs système

## 🛠️ Dépannage

### ESP32 ne se connecte pas
```
Vérifications:
✓ ESP32 alimenté et code téléversé
✓ LED bleue clignotante sur ESP32
✓ Bluetooth activé sur smartphone
✓ Distance < 10m entre ESP32 et smartphone
✓ Aucun autre appareil connecté à l'ESP32
```

### Caméra ne démarre pas
```
Solutions:
✓ Utiliser Chrome (Firefox non supporté)
✓ Page servie en HTTPS (ou localhost)
✓ Autoriser l'accès caméra dans les permissions
✓ Vérifier qu'aucune app n'utilise la caméra
✓ Redémarrer le navigateur
```

### Détection inefficace
```
Ajustements:
✓ Améliorer l'éclairage de la scène
✓ Augmenter le contraste ligne/fond
✓ Ajuster le seuil de détection
✓ Vérifier les couleurs sélectionnées
✓ Stabiliser le smartphone
```

### Moteurs ne répondent pas
```
Diagnostics:
✓ Vérifier les connexions L298N
✓ Batterie moteurs chargée (>7V)
✓ Tester en mode manuel d'abord
✓ Vérifier Serial Monitor ESP32
✓ Contrôler les pins GPIO
```

## ⚙️ Personnalisation

### Modifier les UUIDs BLE
```cpp
// Dans esp32_autonomous_car.ino:
#define SERVICE_UUID        "VOTRE-UUID-SERVICE"
#define CHARACTERISTIC_UUID "VOTRE-UUID-CHARACTERISTIC"

// Dans autonomous_car.js:
bleServiceUUID: 'VOTRE-UUID-SERVICE',
bleCharacteristicUUID: 'VOTRE-UUID-CHARACTERISTIC',
```

### Ajuster la sensibilité
```javascript
// Dans autonomous_car.js - fonction detectLine():
if (leftWeight > rightWeight * 1.5) {  // Changer 1.5
    direction = 'LEFT';
}
```

### Modifier les vitesses
```cpp
// Dans esp32_autonomous_car.ino:
void turnLeft(int speed) {
    ledcWrite(PWM_CHANNEL_LEFT, speed / 2);  // Changer /2
    ledcWrite(PWM_CHANNEL_RIGHT, speed);
}
```

### Ajouter d'autres panneaux
```javascript
// Dans autonomous_car.js - fonction detectTrafficSigns():
// Ajouter des détections pour:
// - Limitation de vitesse
// - Sens interdit
// - Priorité à droite
// etc.
```

## 📈 Améliorations Possibles

### Court Terme
- [ ] Calibration automatique des couleurs
- [ ] Historique des trajectoires
- [ ] Enregistrement vidéo
- [ ] Mode nuit (LED)
- [ ] Buzzer pour alertes

### Moyen Terme
- [ ] Détection de piétons
- [ ] Reconnaissance de chiffres (limitations)
- [ ] Machine Learning pour améliorer détection
- [ ] Mode suivi d'objet
- [ ] Navigation GPS

### Long Terme
- [ ] Multiples véhicules en réseau
- [ ] Planification de trajectoire avancée
- [ ] Interface de simulation
- [ ] Support iOS
- [ ] Application native

## 🔒 Sécurité

### Précautions
⚠️ **Toujours superviser** le véhicule en mode autonome
⚠️ **Tester dans un environnement sûr** avant usage réel
⚠️ **Vérifier les connexions électriques** avant alimentation
⚠️ **Ne pas dépasser** les spécifications des moteurs
⚠️ **Garder une distance** de sécurité avec les personnes

### Limitations
- Vision par caméra sensible à l'éclairage
- Détection simplifiée (pas de deep learning)
- Portée BLE limitée (~10m)
- Dépend de la qualité de la connexion réseau
- Performances variables selon le smartphone

## 📝 Licence

Ce projet est fourni à des fins éducatives et de démonstration.
Libre d'utilisation, modification et distribution.

## 🤝 Contribution

Pour améliorer ce projet:
1. Tester dans différents environnements
2. Documenter les problèmes rencontrés
3. Proposer des améliorations
4. Partager vos modifications

## 📧 Support

En cas de problème:
1. Vérifier la section Dépannage
2. Consulter le Serial Monitor de l'ESP32
3. Vérifier les logs JavaScript (F12 dans Chrome)
4. Tester les composants individuellement

## 🎓 Ressources

### Documentation
- [ESP32 BLE Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/bluetooth/esp_ble.html)
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### Tutoriels
- Vision par ordinateur JavaScript
- Contrôle moteur L298N
- Programmation ESP32 BLE
- Détection de couleurs OpenCV

---

**Version**: 1.0.0  
**Date**: 2025  
**Auteur**: Projet Voiture Autonome ESP32
