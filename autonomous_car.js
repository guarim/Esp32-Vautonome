// Configuration globale
const CONFIG = {
    bleServiceUUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
    bleCharacteristicUUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
    videoWidth: 640,
    videoHeight: 480,
    detectionInterval: 100, // ms
    safeDistance: 20, // cm
    stopDuration: 2000 // ms pour panneau stop
};

// Variables globales
let bleDevice = null;
let bleCharacteristic = null;
let videoStream = null;
let detectionActive = false;
let detectionIntervalId = null;
let commandCount = 0;
let selectedColors = ['white'];
let lineThreshold = 50;
let safeDistance = 20;
let manualSpeed = 50;

// Références DOM
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const logContainer = document.getElementById('logContainer');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateColorSelection();
    log('Système prêt', 'success');
});

// ========== GESTION DES ÉVÉNEMENTS ==========
function initializeEventListeners() {
    // Caméra
    document.getElementById('startCamera').addEventListener('click', startCamera);
    document.getElementById('stopCamera').addEventListener('click', stopCamera);
    document.getElementById('toggleDetection').addEventListener('click', toggleDetection);
    
    // BLE
    document.getElementById('connectBLE').addEventListener('click', connectBLE);
    document.getElementById('disconnectBLE').addEventListener('click', disconnectBLE);
    
    // Contrôles manuels
    document.getElementById('forward').addEventListener('click', () => sendCommand('FORWARD', manualSpeed));
    document.getElementById('backward').addEventListener('click', () => sendCommand('BACKWARD', manualSpeed));
    document.getElementById('left').addEventListener('click', () => sendCommand('LEFT', manualSpeed));
    document.getElementById('right').addEventListener('click', () => sendCommand('RIGHT', manualSpeed));
    document.getElementById('stop').addEventListener('click', () => sendCommand('STOP', 0));
    
    // Sliders
    document.getElementById('lineThreshold').addEventListener('input', (e) => {
        lineThreshold = e.target.value;
        document.getElementById('thresholdValue').textContent = lineThreshold;
    });
    
    document.getElementById('safeDistance').addEventListener('input', (e) => {
        safeDistance = e.target.value;
        document.getElementById('distanceValue').textContent = safeDistance;
    });
    
    document.getElementById('manualSpeed').addEventListener('input', (e) => {
        manualSpeed = e.target.value;
        document.getElementById('speedValue').textContent = manualSpeed;
    });
    
    // Sélection couleurs
    document.querySelectorAll('input[name="color"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateColorSelection);
    });
    
    // Journal
    document.getElementById('clearLog').addEventListener('click', clearLog);
}

// ========== GESTION CAMÉRA ==========
async function startCamera() {
    try {
        const constraints = {
            video: {
                width: { ideal: CONFIG.videoWidth },
                height: { ideal: CONFIG.videoHeight },
                facingMode: 'environment' // Caméra arrière
            }
        };
        
        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = videoStream;
        
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        };
        
        document.getElementById('startCamera').disabled = true;
        document.getElementById('stopCamera').disabled = false;
        document.getElementById('toggleDetection').disabled = false;
        updateStatus('cameraStatus', 'Caméra: Active', 'connected');
        log('Caméra démarrée avec succès', 'success');
        
    } catch (error) {
        log(`Erreur caméra: ${error.message}`, 'error');
        alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
        video.srcObject = null;
    }
    
    if (detectionActive) {
        toggleDetection();
    }
    
    document.getElementById('startCamera').disabled = false;
    document.getElementById('stopCamera').disabled = true;
    document.getElementById('toggleDetection').disabled = true;
    updateStatus('cameraStatus', 'Caméra: Inactive', 'disconnected');
    log('Caméra arrêtée', 'warning');
}

// ========== GESTION BLE ==========
async function connectBLE() {
    try {
        log('Recherche de l\'ESP32...', 'info');
        
        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ services: [CONFIG.bleServiceUUID] }]
        });
        
        log(`Connexion à ${bleDevice.name}...`, 'info');
        const server = await bleDevice.gatt.connect();
        const service = await server.getPrimaryService(CONFIG.bleServiceUUID);
        bleCharacteristic = await service.getCharacteristic(CONFIG.bleCharacteristicUUID);
        
        bleDevice.addEventListener('gattserverdisconnected', onDisconnected);
        
        document.getElementById('connectBLE').disabled = true;
        document.getElementById('disconnectBLE').disabled = false;
        updateStatus('bleStatus', 'BLE: Connecté', 'connected');
        document.getElementById('connectionState').textContent = '✅';
        log(`Connecté à ${bleDevice.name}`, 'success');
        
    } catch (error) {
        log(`Erreur BLE: ${error.message}`, 'error');
    }
}

function disconnectBLE() {
    if (bleDevice && bleDevice.gatt.connected) {
        bleDevice.gatt.disconnect();
    }
}

function onDisconnected() {
    bleCharacteristic = null;
    document.getElementById('connectBLE').disabled = false;
    document.getElementById('disconnectBLE').disabled = true;
    updateStatus('bleStatus', 'BLE: Déconnecté', 'disconnected');
    document.getElementById('connectionState').textContent = '❌';
    log('Déconnecté de l\'ESP32', 'warning');
}

async function sendCommand(command, value = 0) {
    if (!bleCharacteristic) {
        log('ESP32 non connecté', 'error');
        return;
    }
    
    try {
        const data = `${command}:${value}`;
        const encoder = new TextEncoder();
        await bleCharacteristic.writeValue(encoder.encode(data));
        
        commandCount++;
        document.getElementById('commandCount').textContent = commandCount;
        log(`Commande envoyée: ${data}`, 'info');
        
        // Mettre à jour l'affichage
        updateMotorState(command);
        
    } catch (error) {
        log(`Erreur envoi commande: ${error.message}`, 'error');
    }
}

// ========== DÉTECTION ==========
function toggleDetection() {
    detectionActive = !detectionActive;
    
    if (detectionActive) {
        document.getElementById('toggleDetection').textContent = 'Désactiver Détection';
        document.getElementById('toggleDetection').classList.add('danger');
        updateStatus('detectionStatus', 'Détection: Active', 'connected');
        detectionIntervalId = setInterval(processFrame, CONFIG.detectionInterval);
        log('Détection activée', 'success');
    } else {
        document.getElementById('toggleDetection').textContent = 'Activer Détection';
        document.getElementById('toggleDetection').classList.remove('danger');
        updateStatus('detectionStatus', 'Détection: Inactive', 'disconnected');
        clearInterval(detectionIntervalId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        log('Détection désactivée', 'warning');
    }
}

function processFrame() {
    if (!video.videoWidth || !video.videoHeight) return;
    
    // Dessiner le frame actuel
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Analyser la frame
    const lineDetection = detectLine(imageData);
    const signDetection = detectTrafficSigns(imageData);
    const obstacleDetection = detectObstacles(imageData);
    
    // Prendre des décisions
    makeDecision(lineDetection, signDetection, obstacleDetection);
    
    // Visualiser les détections
    visualizeDetections(lineDetection, signDetection, obstacleDetection);
}

function detectLine(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Analyser la partie basse de l'image (zone de la route)
    const startY = Math.floor(height * 0.6);
    const endY = height;
    
    let leftWeight = 0;
    let rightWeight = 0;
    let centerX = width / 2;
    
    for (let y = startY; y < endY; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Vérifier si le pixel correspond aux couleurs sélectionnées
            if (matchesSelectedColor(r, g, b)) {
                if (x < centerX) {
                    leftWeight += (centerX - x);
                } else {
                    rightWeight += (x - centerX);
                }
            }
        }
    }
    
    // Calculer la direction
    let direction = 'CENTER';
    let deviation = 0;
    
    if (leftWeight > rightWeight * 1.5) {
        direction = 'LEFT';
        deviation = Math.min(100, (leftWeight - rightWeight) / 1000);
    } else if (rightWeight > leftWeight * 1.5) {
        direction = 'RIGHT';
        deviation = Math.min(100, (rightWeight - leftWeight) / 1000);
    }
    
    return { direction, deviation, detected: (leftWeight + rightWeight) > 0 };
}

function matchesSelectedColor(r, g, b) {
    for (let color of selectedColors) {
        switch(color) {
            case 'white':
                if (r > 200 && g > 200 && b > 200) return true;
                break;
            case 'black':
                if (r < 50 && g < 50 && b < 50) return true;
                break;
            case 'red':
                if (r > 150 && g < 100 && b < 100) return true;
                break;
            case 'green':
                if (r < 100 && g > 150 && b < 100) return true;
                break;
            case 'yellow':
                if (r > 200 && g > 200 && b < 100) return true;
                break;
            case 'blue':
                if (r < 100 && g < 100 && b > 150) return true;
                break;
        }
    }
    return false;
}

function detectTrafficSigns(imageData) {
    // Détection simplifiée basée sur les couleurs et formes
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    let redCircles = 0; // Stop, interdiction
    let redTriangles = 0; // Danger
    let greenCircles = 0; // Feu vert
    
    // Analyser la partie haute de l'image
    const endY = Math.floor(height * 0.5);
    
    for (let y = 0; y < endY; y += 5) {
        for (let x = 0; x < width; x += 5) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Détection rouge (Stop)
            if (r > 180 && g < 80 && b < 80) {
                redCircles++;
            }
            
            // Détection vert (Feu vert)
            if (r < 80 && g > 180 && b < 80) {
                greenCircles++;
            }
        }
    }
    
    let sign = null;
    if (redCircles > 100) {
        sign = 'STOP';
    } else if (greenCircles > 50) {
        sign = 'GREEN_LIGHT';
    }
    
    return { sign, confidence: redCircles + greenCircles };
}

function detectObstacles(imageData) {
    // Détection basique d'obstacles (changements brusques de couleur)
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    let obstacleDetected = false;
    let estimatedDistance = 100; // cm
    
    // Analyser la zone centrale
    const centerY = Math.floor(height * 0.5);
    const centerX = Math.floor(width * 0.5);
    const radius = 50;
    
    let edgeCount = 0;
    
    for (let y = centerY - radius; y < centerY + radius; y++) {
        for (let x = centerX - radius; x < centerX + radius; x++) {
            if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
                const i = (y * width + x) * 4;
                const iNext = (y * width + (x + 1)) * 4;
                
                const diff = Math.abs(data[i] - data[iNext]) +
                           Math.abs(data[i + 1] - data[iNext + 1]) +
                           Math.abs(data[i + 2] - data[iNext + 2]);
                
                if (diff > 100) {
                    edgeCount++;
                }
            }
        }
    }
    
    if (edgeCount > 200) {
        obstacleDetected = true;
        // Estimation simple de la distance basée sur la taille
        estimatedDistance = Math.max(10, 100 - (edgeCount / 20));
    }
    
    return { detected: obstacleDetected, distance: Math.round(estimatedDistance) };
}

function makeDecision(lineDetection, signDetection, obstacleDetection) {
    // Priorité 1: Obstacles
    if (obstacleDetection.detected && obstacleDetection.distance < safeDistance) {
        sendCommand('STOP', 0);
        document.getElementById('motorState').textContent = '🛑';
        updateDetectionDisplay('obstacle', `Obstacle à ${obstacleDetection.distance}cm`, true);
        return;
    }
    
    // Priorité 2: Panneaux
    if (signDetection.sign === 'STOP') {
        sendCommand('STOP', 0);
        document.getElementById('motorState').textContent = '🛑';
        updateDetectionDisplay('stop', 'Panneau STOP détecté', true);
        
        // Arrêt de 2 secondes
        setTimeout(() => {
            if (detectionActive) {
                sendCommand('FORWARD', 50);
            }
        }, CONFIG.stopDuration);
        return;
    }
    
    // Priorité 3: Suivi de ligne
    if (lineDetection.detected) {
        let speed = 50;
        
        if (lineDetection.direction === 'LEFT') {
            sendCommand('LEFT', Math.round(speed - lineDetection.deviation));
            document.getElementById('direction').textContent = '◀️';
        } else if (lineDetection.direction === 'RIGHT') {
            sendCommand('RIGHT', Math.round(speed - lineDetection.deviation));
            document.getElementById('direction').textContent = '▶️';
        } else {
            sendCommand('FORWARD', speed);
            document.getElementById('direction').textContent = '⬆️';
        }
        
        document.getElementById('motorState').textContent = '▶️';
        document.getElementById('speed').textContent = speed;
    } else {
        // Pas de ligne détectée
        sendCommand('STOP', 0);
        document.getElementById('motorState').textContent = '⏸️';
    }
    
    // Mettre à jour l'affichage de la distance
    if (obstacleDetection.detected) {
        document.getElementById('obstacleDistance').textContent = obstacleDetection.distance;
    } else {
        document.getElementById('obstacleDistance').textContent = '--';
    }
}

function visualizeDetections(lineDetection, signDetection, obstacleDetection) {
    // Dessiner les zones de détection
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
    ctx.lineWidth = 2;
    
    // Zone de détection de ligne (bas)
    ctx.strokeRect(10, canvas.height * 0.6, canvas.width - 20, canvas.height * 0.35);
    
    // Zone de détection de panneaux (haut)
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height * 0.4);
    
    // Zone de détection d'obstacles (centre)
    ctx.strokeStyle = 'rgba(245, 87, 108, 0.8)';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Afficher la direction
    if (lineDetection.detected) {
        ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        ctx.font = '30px Arial';
        ctx.fillText(lineDetection.direction, 20, canvas.height - 20);
    }
    
    // Afficher les panneaux détectés
    if (signDetection.sign) {
        ctx.fillStyle = 'rgba(245, 87, 108, 0.9)';
        ctx.font = 'bold 25px Arial';
        ctx.fillText(signDetection.sign, canvas.width / 2 - 50, 50);
    }
}

// ========== UTILITAIRES ==========
function updateColorSelection() {
    selectedColors = [];
    document.querySelectorAll('input[name="color"]:checked').forEach(checkbox => {
        selectedColors.push(checkbox.value);
        checkbox.parentElement.classList.add('selected');
    });
    
    document.querySelectorAll('input[name="color"]:not(:checked)').forEach(checkbox => {
        checkbox.parentElement.classList.remove('selected');
    });
    
    log(`Couleurs sélectionnées: ${selectedColors.join(', ')}`, 'info');
}

function updateStatus(elementId, text, className) {
    const element = document.getElementById(elementId);
    element.textContent = text;
    element.className = 'status-item';
    if (className) {
        element.classList.add(className);
    }
}

function updateMotorState(command) {
    const states = {
        'FORWARD': '⬆️',
        'BACKWARD': '⬇️',
        'LEFT': '◀️',
        'RIGHT': '▶️',
        'STOP': '⏹️'
    };
    document.getElementById('motorState').textContent = states[command] || '⏸️';
}

function updateDetectionDisplay(type, message, active) {
    const detectionList = document.getElementById('detectionList');
    
    if (active) {
        const existingItem = detectionList.querySelector(`[data-type="${type}"]`);
        if (!existingItem) {
            const item = document.createElement('div');
            item.className = `detection-item ${type}`;
            item.setAttribute('data-type', type);
            item.innerHTML = `
                <span>${message}</span>
                <span>${new Date().toLocaleTimeString()}</span>
            `;
            detectionList.appendChild(item);
        }
    } else {
        const item = detectionList.querySelector(`[data-type="${type}"]`);
        if (item) {
            item.remove();
        }
    }
}

function log(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    
    logContainer.insertBefore(entry, logContainer.firstChild);
    
    // Limiter à 50 entrées
    while (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

function clearLog() {
    logContainer.innerHTML = '<div class="log-entry info">[INFO] Journal effacé</div>';
}

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    log(`Erreur: ${event.message}`, 'error');
});
