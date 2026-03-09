# Guide Sélecteur de Caméra - TACTICAL AUTO

## 📹 Fonctionnalité Multi-Caméras

Le système TACTICAL AUTO intègre maintenant un **sélecteur de caméra intelligent** qui détecte automatiquement toutes les caméras disponibles sur votre appareil et vous permet de choisir celle à utiliser.

---

## ✨ Fonctionnalités

### Détection Automatique
✅ **Scan automatique** au démarrage de l'application
✅ **Identification intelligente** des caméras (avant/arrière)
✅ **Icônes visuelles** pour chaque type de caméra
✅ **Sélection par défaut** de la caméra arrière sur smartphone

### Types de Caméras Détectés

#### 📸 Caméra Arrière (Rear/Back)
- **Icon:** 📸
- **Label:** (Rear) ou (Back)
- **Usage:** Idéal pour suivi de route
- **Sélection:** Par défaut sur smartphone

#### 🤳 Caméra Frontale (Front)
- **Icon:** 🤳
- **Label:** (Front) ou (User)
- **Usage:** Tests, selfie mode
- **Sélection:** Manuelle

#### 📷 Webcam PC
- **Icon:** 📷
- **Label:** Nom du périphérique
- **Usage:** Tests sur ordinateur
- **Sélection:** Automatique si seule disponible

---

## 🎯 Utilisation

### Sur Smartphone Android

#### 1. Premier Lancement
```
┌─────────────────────────────────────────┐
│ 1. Ouvrir l'application web             │
│ 2. Autoriser accès caméra (popup)       │
│ 3. Le système détecte automatiquement:  │
│    📸 Caméra arrière (sélectionnée)     │
│    🤳 Caméra frontale                   │
│ 4. Affichage dans le sélecteur          │
└─────────────────────────────────────────┘
```

#### 2. Sélection Caméra
```
Section "CAMERA" dans panneau droit:

╔═══════════════════════════════════╗
║ 📹 CAMERA                         ║
╠═══════════════════════════════════╣
║ Camera Source                     ║
║ ┌───────────────────────────────┐ ║
║ │ 📸 Camera 0 (Rear)           ▼│ ║
║ └───────────────────────────────┘ ║
║                                   ║
║ Active: 📸 Camera 0 (Rear)        ║
║                                   ║
║ [🔄 REFRESH CAMERAS]              ║
║                                   ║
║ [START CAM] [STOP CAM]            ║
╚═══════════════════════════════════╝
```

#### 3. Changer de Caméra
```
Option A - Caméra arrêtée:
1. Cliquer sur la liste déroulante
2. Sélectionner caméra désirée
3. Cliquer "START CAM"

Option B - Caméra active:
1. Cliquer sur la liste déroulante
2. Sélectionner caméra désirée
3. Le système redémarre automatiquement
   avec la nouvelle caméra
```

### Sur PC (Webcam)

#### 1. Détection Webcam
```
Au lancement:
- Le système détecte votre webcam
- Affiche: 📷 Webcam intégrée
- Ou: 📷 USB Camera
- Sélection automatique
```

#### 2. Webcam Externe USB
```
Si vous branchez une webcam USB:
1. Cliquer "🔄 REFRESH CAMERAS"
2. Nouvelle webcam apparaît dans liste
3. Sélectionner la webcam désirée
4. Cliquer "START CAM"
```

#### 3. Plusieurs Webcams
```
Liste déroulante affiche:
📷 Webcam intégrée
📷 Logitech C920
📷 Microsoft LifeCam
```

---

## 🔧 Options du Sélecteur

### Bouton "REFRESH CAMERAS"
**Utilité:**
- Recharger liste des caméras
- Détecter nouvelles caméras branchées
- Résoudre problèmes de détection

**Quand utiliser:**
```
✅ Après branchement webcam USB
✅ Si caméra manquante dans liste
✅ Après changement permissions
✅ Si liste vide ou erreur
```

### Information "Active"
**Affichage:**
```
Active: 📸 Camera 0 (Rear)
```

**Signification:**
- Montre quelle caméra est actuellement sélectionnée
- Met à jour en temps réel
- Visible même si caméra arrêtée

---

## 📱 Cas d'Usage Spécifiques

### Smartphone en Mode Portrait
```
Configuration recommandée:
- Caméra: 📸 Arrière (Rear)
- Orientation: Paysage
- Position: Fixation sur véhicule

Avantages:
✅ Meilleure qualité caméra arrière
✅ Champ de vision optimal
✅ Moins de distorsion
```

### Smartphone en Mode Selfie
```
Configuration test:
- Caméra: 🤳 Frontale (Front)
- Orientation: Portrait
- Position: Face à l'utilisateur

Avantages:
✅ Visualiser ce que voit la caméra
✅ Tester détections
✅ Debug interface
```

### PC avec Webcam
```
Configuration développement:
- Caméra: 📷 Webcam
- Résolution: Automatique
- Position: Fixe sur bureau

Avantages:
✅ Tests sans smartphone
✅ Développement interface
✅ Debug algorithmes
```

---

## 🛠️ Résolution Problèmes

### Problème 1: "No camera detected"

**Causes possibles:**
- Permissions caméra refusées
- Caméra utilisée par autre app
- Driver caméra manquant (PC)

**Solutions:**
```
Android:
1. Paramètres → Apps → Chrome
2. Permissions → Caméra → Autoriser
3. Fermer autres apps utilisant caméra
4. Redémarrer Chrome
5. Cliquer "🔄 REFRESH CAMERAS"

PC:
1. Vérifier caméra dans Gestionnaire périphériques
2. Mettre à jour drivers webcam
3. Fermer Zoom, Teams, Skype...
4. Autoriser Chrome dans pare-feu
5. Redémarrer navigateur
```

### Problème 2: "Scanning cameras..." bloqué

**Cause:** Timeout détection caméras

**Solution:**
```
1. Attendre 5-10 secondes
2. Rafraîchir page (F5)
3. Vérifier permissions navigateur
4. Cliquer "🔄 REFRESH CAMERAS"
5. Redémarrer appareil si persiste
```

### Problème 3: Sélecteur grisé

**Cause:** Caméra actuellement active

**Solution:**
```
Normal - Le sélecteur se désactive pendant
que la caméra est en cours d'utilisation

Pour changer:
1. Cliquer "STOP CAM"
2. Sélectionneur redevient actif
3. Choisir nouvelle caméra
4. Cliquer "START CAM"

OU

1. Changer directement dans liste
2. Système redémarre automatiquement
```

### Problème 4: Mauvaise caméra sélectionnée

**Cause:** Détection automatique incorrecte

**Solution:**
```
1. Ouvrir liste déroulante
2. Identifier caméras par label:
   📸 = Arrière (pour route)
   🤳 = Frontale (pour tests)
   📷 = Webcam (pour PC)
3. Sélectionner manuellement
4. Label correct s'affiche dans "Active:"
```

### Problème 5: Liste caméras vide

**Diagnostic:**
```javascript
// Ouvrir Console Chrome (F12)
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    console.log(devices.filter(d => d.kind === 'videoinput'));
  });

Si résultat vide:
→ Problème permissions système
→ Caméra non reconnue par OS
→ Driver manquant
```

**Solution:**
```
1. Vérifier caméra fonctionne (autre app)
2. Réautoriser permissions Chrome
3. Mettre à jour Chrome
4. Redémarrer appareil
```

---

## 💡 Conseils & Astuces

### Optimisation Qualité

**Smartphone:**
```
✅ Utiliser TOUJOURS caméra arrière (📸)
   - Meilleure qualité capteur
   - Autofocus plus rapide
   - Moins de distorsion

✅ Nettoyer objectif avant usage
   - Améliore détection lignes
   - Réduit artefacts YOLO
   - Meilleure exposition
```

**PC Webcam:**
```
✅ Positionner face à piste/circuit
✅ Éclairage uniforme
✅ Éviter contre-jour
✅ Tester angle avant fixation
```

### Basculement Rapide

**Raccourci pour tests:**
```
1. Garder onglet ouvert
2. Changer caméra dans liste
3. Pas besoin redémarrer app
4. Idéal pour comparer qualités
```

**Comparaison Frontale vs Arrière:**
```
Test A - Caméra Arrière:
→ Démarrer caméra 📸
→ Observer qualité détection
→ Noter FPS et précision

Test B - Caméra Frontale:
→ Changer vers 🤳
→ Comparer résultats
→ Constater différence qualité
```

### Préférences Recommandées

**Pour Usage Réel (Voiture):**
```
Caméra: 📸 Arrière (Rear)
Raison: Meilleure qualité optique
```

**Pour Tests Intérieurs:**
```
Caméra: 🤳 Frontale (Front) ou 📷 Webcam
Raison: Plus pratique, visualisation directe
```

**Pour Développement:**
```
Caméra: 📷 Webcam PC
Raison: Confort, accès console debug
```

---

## 📊 Informations Techniques

### Format Labels Caméras

**Android:**
```
Format standard:
"camera2 0, facing back"  → 📸 camera2 0 (Rear)
"camera2 1, facing front" → 🤳 camera2 1 (Front)

Format Samsung:
"Back Camera"             → 📸 Back Camera (Rear)
"Front Camera"            → 🤳 Front Camera (Front)
```

**iOS (si supporté):**
```
"Back Camera"             → 📸 Back Camera (Rear)
"Front Camera"            → 🤳 Front Camera (Front)
```

**PC Windows:**
```
"Integrated Webcam"       → 📷 Integrated Webcam
"USB2.0 HD UVC WebCam"    → 📷 USB2.0 HD UVC WebCam
"Logitech HD Pro C920"    → 📷 Logitech HD Pro C920
```

### Détection Automatique

**Algorithme:**
```javascript
1. Scanner label caméra en minuscules
2. Chercher mots-clés:
   - "back", "rear", "environment" → Arrière
   - "front", "user", "face"       → Frontale
   - Autre                         → Webcam
3. Assigner icône appropriée
4. Sélectionner arrière par défaut
```

### Contraintes Techniques

**DeviceId:**
```
Format: "abc123def456..."
- Unique par appareil
- Persistant entre sessions
- Utilisé pour sélection exacte
```

**Fallback Mode:**
```
Si deviceId échoue:
→ Mode facingMode: 'environment'
→ Système choisit meilleure caméra
→ Pas de garantie arrière/avant
```

---

## 🔐 Permissions & Sécurité

### Demande Permissions

**Première fois:**
```
Chrome demande:
┌──────────────────────────────────┐
│ "tactical_auto.html" wants to    │
│ use your camera                   │
│                                   │
│ [Block]  [Allow]                 │
└──────────────────────────────────┘

Cliquer: [Allow]
```

**Permissions persistantes:**
```
Une fois autorisé:
✅ Permission sauvegardée
✅ Pas de nouvelle demande
✅ Sauf si révoquée manuellement
```

### Révocation Permissions

**Chrome Android:**
```
Paramètres → Confidentialité → 
Paramètres des sites → Caméra →
Trouver site → Supprimer
```

**Chrome Desktop:**
```
Barre URL → Cliquer icône 🔒 →
Caméra → Réinitialiser
```

---

## 📈 Performance

### Impact FPS

**Caméra Arrière (Smartphone):**
```
Résolution: 1920x1080
FPS Caméra: 30 fps
FPS Détection: 8-12 fps (limité par YOLO)
Impact: Aucun (caméra pas limitante)
```

**Caméra Frontale (Smartphone):**
```
Résolution: 1280x720 (souvent inférieure)
FPS Caméra: 30 fps
FPS Détection: 8-12 fps
Qualité: Réduite vs arrière
```

**Webcam PC:**
```
Résolution: Variable (720p-4K)
FPS Caméra: 15-60 fps
FPS Détection: 10-15 fps (PC plus puissant)
Qualité: Dépend webcam
```

### Recommandations

**Maximiser Performance:**
```
1. Utiliser caméra arrière smartphone
   (meilleur compromis qualité/perf)

2. Éviter 4K webcams
   (traitement YOLO trop lourd)

3. Privilégier 720p-1080p
   (optimal pour détection)

4. Éclairage suffisant
   (réduit bruit, améliore détection)
```

---

## 🎓 Exemples d'Utilisation

### Scénario 1: Setup Initial Voiture

```
1. Monter smartphone sur support
2. Ouvrir TACTICAL AUTO
3. Autoriser caméra
4. Vérifier sélection: 📸 Rear
5. Cliquer "START CAM"
6. Ajuster angle support
7. Vérifier cadrage lignes
8. Activer mode autonome
```

### Scénario 2: Test Sur Table

```
1. Poser smartphone à plat
2. Caméra vers circuit jouet
3. Sélectionner: 📸 Rear ou 🤳 Front
   (selon position smartphone)
4. "START CAM"
5. Tester détection lignes
6. Ajuster paramètres
```

### Scénario 3: Debug sur PC

```
1. Ouvrir Chrome desktop
2. Webcam détectée auto: 📷
3. "START CAM"
4. Console debug (F12) ouverte
5. Tester algorithmes
6. Analyser logs
7. Optimiser code
```

---

## ✅ Checklist Utilisation

Avant chaque session:

```
☐ Permissions caméra autorisées
☐ Bonne caméra sélectionnée (📸 pour route)
☐ Objectif propre
☐ Éclairage suffisant
☐ Angle caméra vérifié
☐ Test "START CAM" OK
☐ Image claire et stable
☐ FPS >8 minimum
```

---

## 📚 Références

### APIs Utilisées
- **MediaDevices.enumerateDevices()** - Liste caméras
- **MediaDevices.getUserMedia()** - Accès flux vidéo
- **MediaStreamTrack.stop()** - Arrêt caméra

### Compatibilité
- ✅ Chrome Android 90+
- ✅ Chrome Desktop 90+
- ✅ Edge 90+
- ⚠️ Firefox (support partiel)
- ❌ Safari iOS (limitations)

---

**Version:** 2.1  
**Date:** 2025  
**Feature:** Multi-Camera Selector  
**Compatibilité:** Smartphone + PC
