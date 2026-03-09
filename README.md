🎯 Système TACTICAL AUTO - Fonctionnalités Avancées
✨ Améliorations Majeures Implémentées
1. Détection de Trajectoire Entre Deux Lignes
✅ Le véhicule se maintient centré entre deux lignes (voie gauche + bordure droite)
✅ Calcul automatique du centre de voie
✅ Correction proportionnelle si déviation > 2%
✅ Visualisation temps réel des lignes sur la vidéo
2. Détection Panneaux Optimisée
✅ Zone de détection : dernier tiers DROIT de l'image uniquement (côté trottoir)
✅ Analyse sur les 2/3 supérieurs pour éviter le sol
✅ STOP : Arrêt automatique 2 secondes
✅ Feux : Rouge = arrêt / Vert = passage
3. Détection d'Obstacles Avancée
Obstacles Immobiles (Ultrason HC-SR04)
✅ Mesure précise 2-400 cm
✅ Rafraîchissement 100ms
✅ Transmission BLE vers smartphone
Véhicules Mobiles (YOLO/COCO-SSD)
✅ Classes détectées : person, car, bus, truck, motorcycle, bicycle
✅ Zone : entre les lignes ± 20% de marge
✅ Filtrage objets hors voie
✅ Estimation distance basée sur taille bbox
✅ Calibration manuelle via slider (0.5x - 2.0x)
✅ Correction avec données ultrason
4. Gestion Distances Intelligente

< 20 cm : Arrêt immédiat ⛔
< 35 cm : Ralentissement progressif ⚠️
30 ± 5 cm : Maintien distance avec régulation proportionnelle 🎯
> 35 cm : Vitesse normale ✅

5. Interface HUD Militaire (1920x1080)
Design Cockpit Tactique
✅ Fond noir avec grille semi-transparente
✅ Palette optimisée : Vert #00ff00, Rouge #ff0000, Blanc, Bleu #00ffff
✅ Effets néon et ombres lumineuses
✅ Polices : Orbitron (titres) + Rajdhani (corps)
Télémétrie Temps Réel

Moteur L/R avec pourcentages
Direction (FORWARD/LEFT/RIGHT/STOP)
FPS détection
Vitesse estimée
Distance obstacle

Modules de Détection Individuels
✅ 4 toggles ON/OFF :

Line Following
Traffic Signs
YOLO Detection
Ultrasonic Sensor

Journal d'Événements
✅ Horodatage précis HH:MM:SS
✅ Codes couleur (Success/Info/Warning/Error)
✅ Auto-scroll
✅ Historique 100 entrées
Mode Autonome
✅ Bouton "ENGAGE AUTONOMOUS"
✅ Active automatiquement tous les modules
✅ Voyants d'état temps réel
✅ Désactivation sécurisée
🔧 Architecture Technique
Frontend (HTML/JS)

Interface HUD responsive 1920x1080
TensorFlow.js 4.11.0 + COCO-SSD 2.2.3
Canvas API pour visualisation
Web Bluetooth pour ESP32
MediaDevices pour caméra rear-facing

Backend (ESP32)

Contrôle indépendant moteurs L/R
PWM 8-bit (0-255) à 1kHz
Capteur ultrason intégré
BLE bidirectionnel
Timeout sécurité 500ms

Protocole BLE
Format: "COMMAND:LEFT_SPEED:RIGHT_SPEED"
Exemples:
  - "FORWARD:50:50"  → Avancer droit 50%
  - "LEFT:35:50"     → Tourner gauche
  - "RIGHT:50:35"    → Tourner droite
  - "STOP:0:0"       → Arrêt
📊 Logique de Décision (Priorités)

Panneaux → Arrêt immédiat si STOP/Rouge
Objets YOLO → Gestion distance sécurité
Lignes → Centrage dans voie

🎮 Utilisation
1. Téléverser tactical_auto_esp32.ino sur ESP32
2. Héberger tactical_auto.html en HTTPS
3. Ouvrir sur smartphone Android
4. Connecter BLE → Démarrer caméra
5. Sélectionner couleurs lignes
6. ENGAGE AUTONOMOUS
Le système est 100% opérationnel avec toutes les fonctionnalités
