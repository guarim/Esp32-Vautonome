// ==================== CONFIGURATION ====================
const CONFIG = {
    ble: {
        serviceUUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
        characteristicUUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8'
    },
    video: {
        width: 1280,
        height: 720,
        facingMode: 'environment'
    },
    detection: {
        interval: 100, // ms between frames
        lineMargin: 0.20, // 20% margin for mobile object detection
        slowdownDistance: 35, // cm
        stopDistance: 20, // cm
        followDistance: 30, // cm
        followTolerance: 5 // cm tolerance for distance keeping
    },
    yolo: {
        enabled: true,
        confidenceThreshold: 0.5,
        mobileClasses: ['person', 'bicycle', 'car', 'motorcycle', 'bus', 'truck']
    }
};

// ==================== GLOBAL STATE ====================
const STATE = {
    // BLE
    bleDevice: null,
    bleCharacteristic: null,
    connected: false,
    commandCount: 0,
    
    // Camera & Detection
    videoStream: null,
    detectionActive: false,
    detectionIntervalId: null,
    autonomousMode: false,
    
    // Camera Management
    availableCameras: [],
    selectedCameraId: null,
    currentFacingMode: 'environment',
    
    // Detection Modules
    modules: {
        lineFollow: false,
        trafficSigns: false,
        yolo: false,
        ultrasonic: false
    },
    
    // YOLO
    yoloModel: null,
    yoloReady: false,
    
    // Settings
    selectedColors: ['white'],
    safeDistance: 20,
    followDistance: 30,
    distanceCalibration: 1.0,
    manualSpeed: 50,
    
    // Telemetry
    motorLeft: 0,
    motorRight: 0,
    currentDirection: 'STOP',
    fps: 0,
    speed: 0,
    estimatedDistance: null,
    ultrasonicDistance: null,
    
    // Line Detection
    leftLine: null,
    rightLine: null,
    laneCenter: null,
    
    // Performance
    lastFrameTime: 0,
    frameCount: 0,
    
    // Active Detections
    activeDetections: new Map()
};

// ==================== DOM REFERENCES ====================
const DOM = {
    video: document.getElementById('video'),
    canvas: document.getElementById('canvas'),
    
    // Lights
    bleLight: document.getElementById('bleLight'),
    cameraLight: document.getElementById('cameraLight'),
    yoloLight: document.getElementById('yoloLight'),
    autoLight: document.getElementById('autoLight'),
    
    // Telemetry
    motorLeft: document.getElementById('motorLeft'),
    motorRight: document.getElementById('motorRight'),
    direction: document.getElementById('direction'),
    fps: document.getElementById('fps'),
    speed: document.getElementById('speed'),
    distance: document.getElementById('distance'),
    
    // Controls
    connectBLE: document.getElementById('connectBLE'),
    disconnectBLE: document.getElementById('disconnectBLE'),
    startCamera: document.getElementById('startCamera'),
    stopCamera: document.getElementById('stopCamera'),
    autonomousMode: document.getElementById('autonomousMode'),
    
    // Camera Selection
    cameraSelect: document.getElementById('cameraSelect'),
    refreshCameras: document.getElementById('refreshCameras'),
    
    // Toggles
    toggleLineFollow: document.getElementById('toggleLineFollow'),
    toggleSigns: document.getElementById('toggleSigns'),
    toggleYOLO: document.getElementById('toggleYOLO'),
    toggleUltrasonic: document.getElementById('toggleUltrasonic'),
    
    // Sliders
    safeDistance: document.getElementById('safeDistance'),
    safeDistanceValue: document.getElementById('safeDistanceValue'),
    followDistance: document.getElementById('followDistance'),
    followDistanceValue: document.getElementById('followDistanceValue'),
    distanceCalibration: document.getElementById('distanceCalibration'),
    calibrationValue: document.getElementById('calibrationValue'),
    manualSpeed: document.getElementById('manualSpeed'),
    manualSpeedValue: document.getElementById('manualSpeedValue'),
    
    // Display
    commandCount: document.getElementById('commandCount'),
    commandProgress: document.getElementById('commandProgress'),
    yoloModel: document.getElementById('yoloModel'),
    detectionCount: document.getElementById('detectionCount'),
    detectionDisplay: document.getElementById('detectionDisplay'),
    zoneIndicator: document.getElementById('zoneIndicator'),
    eventLog: document.getElementById('eventLog'),
    
    // Manual Controls
    forward: document.getElementById('forward'),
    backward: document.getElementById('backward'),
    left: document.getElementById('left'),
    right: document.getElementById('right'),
    stopBtn: document.getElementById('stopBtn'),
    
    clearLog: document.getElementById('clearLog')
};

const ctx = DOM.canvas.getContext('2d');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    initializeEventListeners();
    await detectCameras();
    await loadYOLOModel();
    log('TACTICAL AUTO SYSTEM ONLINE', 'success');
});

function initializeEventListeners() {
    // BLE
    DOM.connectBLE.addEventListener('click', connectBLE);
    DOM.disconnectBLE.addEventListener('click', disconnectBLE);
    
    // Camera
    DOM.startCamera.addEventListener('click', startCamera);
    DOM.stopCamera.addEventListener('click', stopCamera);
    DOM.cameraSelect.addEventListener('change', onCameraChange);
    DOM.refreshCameras.addEventListener('click', detectCameras);
    
    // Autonomous
    DOM.autonomousMode.addEventListener('click', toggleAutonomousMode);
    
    // Module Toggles
    DOM.toggleLineFollow.addEventListener('click', () => toggleModule('lineFollow'));
    DOM.toggleSigns.addEventListener('click', () => toggleModule('trafficSigns'));
    DOM.toggleYOLO.addEventListener('click', () => toggleModule('yolo'));
    DOM.toggleUltrasonic.addEventListener('click', () => toggleModule('ultrasonic'));
    
    // Manual Controls
    DOM.forward.addEventListener('click', () => sendManualCommand('FORWARD'));
    DOM.backward.addEventListener('click', () => sendManualCommand('BACKWARD'));
    DOM.left.addEventListener('click', () => sendManualCommand('LEFT'));
    DOM.right.addEventListener('click', () => sendManualCommand('RIGHT'));
    DOM.stopBtn.addEventListener('click', () => sendManualCommand('STOP'));
    
    // Sliders
    DOM.safeDistance.addEventListener('input', (e) => {
        STATE.safeDistance = parseInt(e.target.value);
        DOM.safeDistanceValue.textContent = STATE.safeDistance;
    });
    
    DOM.followDistance.addEventListener('input', (e) => {
        STATE.followDistance = parseInt(e.target.value);
        DOM.followDistanceValue.textContent = STATE.followDistance;
    });
    
    DOM.distanceCalibration.addEventListener('input', (e) => {
        STATE.distanceCalibration = parseFloat(e.target.value);
        DOM.calibrationValue.textContent = STATE.distanceCalibration.toFixed(1);
    });
    
    DOM.manualSpeed.addEventListener('input', (e) => {
        STATE.manualSpeed = parseInt(e.target.value);
        DOM.manualSpeedValue.textContent = STATE.manualSpeed;
    });
    
    // Color Selection
    document.querySelectorAll('input[name="lineColor"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateColorSelection);
    });
    
    // Log
    DOM.clearLog.addEventListener('click', clearLog);
}

// ==================== YOLO MODEL LOADING ====================
async function loadYOLOModel() {
    try {
        log('Loading YOLO model...', 'info');
        DOM.yoloModel.textContent = 'Loading...';
        
        // Using COCO-SSD (similar to YOLO) as it's available in TensorFlow.js
        STATE.yoloModel = await cocoSsd.load();
        STATE.yoloReady = true;
        
        DOM.yoloModel.textContent = 'COCO-SSD Ready';
        DOM.yoloLight.classList.add('active');
        log('YOLO model loaded successfully', 'success');
    } catch (error) {
        log(`YOLO model loading failed: ${error.message}`, 'error');
        DOM.yoloModel.textContent = 'Failed';
        STATE.yoloReady = false;
    }
}

// ==================== BLE CONNECTION ====================
async function connectBLE() {
    try {
        log('Scanning for ESP32...', 'info');
        
        STATE.bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ services: [CONFIG.ble.serviceUUID] }]
        });
        
        log(`Connecting to ${STATE.bleDevice.name}...`, 'info');
        const server = await STATE.bleDevice.gatt.connect();
        const service = await server.getPrimaryService(CONFIG.ble.serviceUUID);
        STATE.bleCharacteristic = await service.getCharacteristic(CONFIG.ble.characteristicUUID);
        
        STATE.bleDevice.addEventListener('gattserverdisconnected', onBLEDisconnected);
        STATE.connected = true;
        
        DOM.connectBLE.disabled = true;
        DOM.disconnectBLE.disabled = false;
        DOM.bleLight.classList.add('active');
        
        log(`Connected to ${STATE.bleDevice.name}`, 'success');
        
    } catch (error) {
        log(`BLE connection error: ${error.message}`, 'error');
    }
}

function disconnectBLE() {
    if (STATE.bleDevice && STATE.bleDevice.gatt.connected) {
        STATE.bleDevice.gatt.disconnect();
    }
}

function onBLEDisconnected() {
    STATE.connected = false;
    STATE.bleCharacteristic = null;
    
    DOM.connectBLE.disabled = false;
    DOM.disconnectBLE.disabled = true;
    DOM.bleLight.classList.remove('active');
    
    log('Disconnected from ESP32', 'warning');
}

async function sendCommand(command, leftSpeed, rightSpeed) {
    if (!STATE.connected || !STATE.bleCharacteristic) {
        return;
    }
    
    try {
        const data = `${command}:${leftSpeed}:${rightSpeed}`;
        const encoder = new TextEncoder();
        await STATE.bleCharacteristic.writeValue(encoder.encode(data));
        
        STATE.commandCount++;
        DOM.commandCount.textContent = STATE.commandCount;
        DOM.commandProgress.style.width = `${Math.min(100, (STATE.commandCount % 100))}%`;
        
        STATE.motorLeft = leftSpeed;
        STATE.motorRight = rightSpeed;
        STATE.currentDirection = command;
        
        updateTelemetry();
        
    } catch (error) {
        log(`Command send error: ${error.message}`, 'error');
    }
}

function sendManualCommand(command) {
    if (STATE.autonomousMode) {
        log('Cannot send manual commands in autonomous mode', 'warning');
        return;
    }
    
    const speed = STATE.manualSpeed;
    let leftSpeed = 0, rightSpeed = 0;
    
    switch(command) {
        case 'FORWARD':
            leftSpeed = rightSpeed = speed;
            break;
        case 'BACKWARD':
            leftSpeed = rightSpeed = -speed;
            break;
        case 'LEFT':
            leftSpeed = speed / 2;
            rightSpeed = speed;
            break;
        case 'RIGHT':
            leftSpeed = speed;
            rightSpeed = speed / 2;
            break;
        case 'STOP':
            leftSpeed = rightSpeed = 0;
            break;
    }
    
    sendCommand(command, leftSpeed, rightSpeed);
    log(`Manual command: ${command}`, 'info');
}

// ==================== CAMERA ====================
async function detectCameras() {
    try {
        log('Detecting available cameras...', 'info');
        DOM.cameraSelect.innerHTML = '<option value="">Scanning cameras...</option>';
        
        // Demander permission d'accès aux caméras
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        
        // Énumérer les périphériques
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        STATE.availableCameras = videoDevices;
        
        // Remplir le sélecteur
        DOM.cameraSelect.innerHTML = '';
        
        if (videoDevices.length === 0) {
            DOM.cameraSelect.innerHTML = '<option value="">No camera detected</option>';
            log('No cameras detected', 'error');
            return;
        }
        
        videoDevices.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            
            // Déterminer le type de caméra
            let label = device.label || `Camera ${index + 1}`;
            let icon = '📷';
            
            // Détecter caméra frontale/arrière
            const labelLower = label.toLowerCase();
            if (labelLower.includes('back') || labelLower.includes('rear') || labelLower.includes('environment')) {
                icon = '📸';
                label = label + ' (Rear)';
            } else if (labelLower.includes('front') || labelLower.includes('user') || labelLower.includes('face')) {
                icon = '🤳';
                label = label + ' (Front)';
            }
            
            option.textContent = `${icon} ${label}`;
            option.dataset.label = label;
            option.dataset.icon = icon;
            
            DOM.cameraSelect.appendChild(option);
            
            // Sélectionner caméra arrière par défaut sur mobile
            if (labelLower.includes('back') || labelLower.includes('rear') || labelLower.includes('environment')) {
                option.selected = true;
                STATE.selectedCameraId = device.deviceId;
            }
        });
        
        // Si aucune caméra arrière, sélectionner la première
        if (!STATE.selectedCameraId && videoDevices.length > 0) {
            STATE.selectedCameraId = videoDevices[0].deviceId;
        }
        
        log(`Found ${videoDevices.length} camera(s)`, 'success');
        
        // Afficher info sur la caméra sélectionnée
        displayCameraInfo();
        
    } catch (error) {
        log(`Camera detection error: ${error.message}`, 'error');
        DOM.cameraSelect.innerHTML = '<option value="">Camera access denied</option>';
    }
}

function onCameraChange(event) {
    STATE.selectedCameraId = event.target.value;
    displayCameraInfo();
    log(`Camera selected: ${event.target.options[event.target.selectedIndex].text}`, 'info');
    
    // Si caméra déjà active, redémarrer avec nouvelle caméra
    if (STATE.videoStream) {
        stopCamera();
        setTimeout(() => startCamera(), 500);
    }
}

function displayCameraInfo() {
    const selectedOption = DOM.cameraSelect.options[DOM.cameraSelect.selectedIndex];
    if (!selectedOption) return;
    
    // Vérifier si l'info existe déjà
    let infoDiv = document.querySelector('.camera-info');
    if (!infoDiv) {
        infoDiv = document.createElement('div');
        infoDiv.className = 'camera-info';
        DOM.cameraSelect.parentElement.appendChild(infoDiv);
    }
    
    const icon = selectedOption.dataset.icon || '📷';
    const label = selectedOption.dataset.label || selectedOption.text;
    
    infoDiv.innerHTML = `
        <span class="camera-icon">${icon}</span>
        <span>Active: ${label}</span>
    `;
}

async function startCamera() {
    try {
        if (!STATE.selectedCameraId) {
            log('Please select a camera first', 'warning');
            await detectCameras();
            if (!STATE.selectedCameraId) {
                throw new Error('No camera available');
            }
        }
        
        const constraints = {
            video: {
                deviceId: STATE.selectedCameraId ? { exact: STATE.selectedCameraId } : undefined,
                width: { ideal: CONFIG.video.width },
                height: { ideal: CONFIG.video.height }
            }
        };
        
        log(`Starting camera: ${DOM.cameraSelect.options[DOM.cameraSelect.selectedIndex].text}`, 'info');
        
        STATE.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        DOM.video.srcObject = STATE.videoStream;
        
        DOM.video.onloadedmetadata = () => {
            DOM.canvas.width = DOM.video.videoWidth;
            DOM.canvas.height = DOM.video.videoHeight;
            log(`Camera started: ${DOM.canvas.width}x${DOM.canvas.height}`, 'success');
        };
        
        DOM.startCamera.disabled = true;
        DOM.stopCamera.disabled = false;
        DOM.cameraSelect.disabled = true;
        DOM.refreshCameras.disabled = true;
        DOM.cameraLight.classList.add('active');
        
    } catch (error) {
        log(`Camera error: ${error.message}`, 'error');
        
        // Si erreur avec caméra spécifique, essayer mode générique
        if (error.name === 'OverconstrainedError' || error.name === 'NotFoundError') {
            log('Trying fallback camera mode...', 'warning');
            try {
                const fallbackConstraints = {
                    video: {
                        width: { ideal: CONFIG.video.width },
                        height: { ideal: CONFIG.video.height },
                        facingMode: CONFIG.video.facingMode
                    }
                };
                
                STATE.videoStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
                DOM.video.srcObject = STATE.videoStream;
                
                DOM.video.onloadedmetadata = () => {
                    DOM.canvas.width = DOM.video.videoWidth;
                    DOM.canvas.height = DOM.video.videoHeight;
                    log(`Camera started (fallback): ${DOM.canvas.width}x${DOM.canvas.height}`, 'success');
                };
                
                DOM.startCamera.disabled = true;
                DOM.stopCamera.disabled = false;
                DOM.cameraSelect.disabled = true;
                DOM.refreshCameras.disabled = true;
                DOM.cameraLight.classList.add('active');
                
            } catch (fallbackError) {
                log(`Fallback camera failed: ${fallbackError.message}`, 'error');
                alert('Unable to access camera. Please check permissions.');
            }
        } else {
            alert('Unable to access camera. Please check permissions.');
        }
    }
}

function stopCamera() {
    if (STATE.videoStream) {
        STATE.videoStream.getTracks().forEach(track => track.stop());
        STATE.videoStream = null;
        DOM.video.srcObject = null;
    }
    
    if (STATE.detectionActive || STATE.autonomousMode) {
        stopDetection();
    }
    
    DOM.startCamera.disabled = false;
    DOM.stopCamera.disabled = true;
    DOM.cameraSelect.disabled = false;
    DOM.refreshCameras.disabled = false;
    DOM.cameraLight.classList.remove('active');
    
    log('Camera stopped', 'warning');
}

// ==================== DETECTION MODULES ====================
function toggleModule(moduleName) {
    STATE.modules[moduleName] = !STATE.modules[moduleName];
    const toggleElement = document.getElementById(`toggle${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`);
    
    if (STATE.modules[moduleName]) {
        toggleElement.classList.add('active');
        log(`Module ${moduleName} ENABLED`, 'success');
    } else {
        toggleElement.classList.remove('active');
        log(`Module ${moduleName} DISABLED`, 'warning');
    }
}

function toggleAutonomousMode() {
    STATE.autonomousMode = !STATE.autonomousMode;
    
    if (STATE.autonomousMode) {
        if (!STATE.videoStream) {
            log('Camera must be started first', 'error');
            STATE.autonomousMode = false;
            return;
        }
        
        // Enable all detection modules
        STATE.modules.lineFollow = true;
        STATE.modules.trafficSigns = true;
        STATE.modules.yolo = true;
        STATE.modules.ultrasonic = true;
        
        // Update toggles
        DOM.toggleLineFollow.classList.add('active');
        DOM.toggleSigns.classList.add('active');
        DOM.toggleYOLO.classList.add('active');
        DOM.toggleUltrasonic.classList.add('active');
        
        // Start detection
        startDetection();
        
        DOM.autonomousMode.classList.add('active');
        DOM.autonomousMode.textContent = 'DISENGAGE AUTONOMOUS';
        DOM.autoLight.classList.add('active');
        DOM.zoneIndicator.textContent = 'AUTONOMOUS MODE: ACTIVE';
        
        log('AUTONOMOUS MODE ENGAGED', 'success');
        
    } else {
        stopDetection();
        
        DOM.autonomousMode.classList.remove('active');
        DOM.autonomousMode.textContent = 'ENGAGE AUTONOMOUS';
        DOM.autoLight.classList.remove('active');
        DOM.zoneIndicator.textContent = 'LANE TRACKING: STANDBY';
        
        sendCommand('STOP', 0, 0);
        log('AUTONOMOUS MODE DISENGAGED', 'warning');
    }
}

function startDetection() {
    if (STATE.detectionActive) return;
    
    STATE.detectionActive = true;
    STATE.lastFrameTime = performance.now();
    STATE.frameCount = 0;
    
    STATE.detectionIntervalId = setInterval(processFrame, CONFIG.detection.interval);
    log('Detection started', 'success');
}

function stopDetection() {
    if (!STATE.detectionActive) return;
    
    STATE.detectionActive = false;
    clearInterval(STATE.detectionIntervalId);
    ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    
    log('Detection stopped', 'warning');
}

// ==================== FRAME PROCESSING ====================
async function processFrame() {
    if (!DOM.video.videoWidth || !DOM.video.videoHeight) return;
    
    // Update FPS
    updateFPS();
    
    // Draw current frame
    ctx.drawImage(DOM.video, 0, 0, DOM.canvas.width, DOM.canvas.height);
    const imageData = ctx.getImageData(0, 0, DOM.canvas.width, DOM.canvas.height);
    
    // Clear previous detections
    STATE.activeDetections.clear();
    
    // Run enabled detection modules
    let lineDetection = null;
    let signDetection = null;
    let yoloDetections = [];
    
    if (STATE.modules.lineFollow) {
        lineDetection = detectLanes(imageData);
        visualizeLanes(lineDetection);
    }
    
    if (STATE.modules.trafficSigns) {
        signDetection = detectTrafficSigns(imageData);
        visualizeTrafficSigns(signDetection);
    }
    
    if (STATE.modules.yolo && STATE.yoloReady) {
        yoloDetections = await detectYOLOObjects();
        visualizeYOLODetections(yoloDetections);
    }
    
    // Make driving decision
    if (STATE.autonomousMode) {
        makeAutonomousDecision(lineDetection, signDetection, yoloDetections);
    }
    
    // Update detection display
    updateDetectionDisplay();
}

// ==================== LANE DETECTION ====================
function detectLanes(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Analyze bottom 60% for lane detection
    const startY = Math.floor(height * 0.4);
    const endY = height;
    
    // Find left and right lines
    let leftLineX = 0;
    let rightLineX = width;
    let leftLinePixels = 0;
    let rightLinePixels = 0;
    
    // Divide frame into left and right halves
    const centerX = width / 2;
    
    for (let y = startY; y < endY; y += 2) {
        // Left half - look for right edge of left line
        for (let x = 0; x < centerX; x++) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (matchesSelectedColor(r, g, b)) {
                if (x > leftLineX) {
                    leftLineX = x;
                    leftLinePixels++;
                }
            }
        }
        
        // Right half - look for left edge of right line
        for (let x = width - 1; x > centerX; x--) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (matchesSelectedColor(r, g, b)) {
                if (x < rightLineX) {
                    rightLineX = x;
                    rightLinePixels++;
                }
            }
        }
    }
    
    // Calculate lane center
    const laneCenter = (leftLineX + rightLineX) / 2;
    const vehicleCenter = width / 2;
    const deviation = vehicleCenter - laneCenter;
    const deviationPercent = (deviation / width) * 100;
    
    STATE.leftLine = leftLinePixels > 50 ? leftLineX : null;
    STATE.rightLine = rightLinePixels > 50 ? rightLineX : null;
    STATE.laneCenter = (STATE.leftLine && STATE.rightLine) ? laneCenter : null;
    
    return {
        leftLine: STATE.leftLine,
        rightLine: STATE.rightLine,
        laneCenter: STATE.laneCenter,
        deviation: deviationPercent,
        detected: STATE.leftLine !== null && STATE.rightLine !== null
    };
}

function matchesSelectedColor(r, g, b) {
    for (let color of STATE.selectedColors) {
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

// ==================== TRAFFIC SIGN DETECTION ====================
function detectTrafficSigns(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Analyze right third of image, top 2/3
    const startX = Math.floor(width * 2/3);
    const endX = width;
    const startY = 0;
    const endY = Math.floor(height * 2/3);
    
    let redPixels = 0;
    let greenPixels = 0;
    
    for (let y = startY; y < endY; y += 3) {
        for (let x = startX; x < endX; x += 3) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Red detection (STOP sign, red light)
            if (r > 180 && g < 80 && b < 80) {
                redPixels++;
            }
            
            // Green detection (green light)
            if (r < 80 && g > 180 && b < 80) {
                greenPixels++;
            }
        }
    }
    
    let sign = null;
    let confidence = 0;
    
    if (redPixels > 150) {
        sign = 'STOP';
        confidence = Math.min(100, (redPixels / 500) * 100);
    } else if (greenPixels > 100) {
        sign = 'GREEN_LIGHT';
        confidence = Math.min(100, (greenPixels / 300) * 100);
    }
    
    return { sign, confidence };
}

// ==================== YOLO OBJECT DETECTION ====================
async function detectYOLOObjects() {
    if (!STATE.yoloModel || !STATE.yoloReady) {
        return [];
    }
    
    try {
        const predictions = await STATE.yoloModel.detect(DOM.video);
        
        // Filter for mobile objects and apply lane constraints
        const mobilePredictions = predictions.filter(pred => {
            // Check if it's a mobile object
            if (!CONFIG.yolo.mobileClasses.includes(pred.class)) {
                return false;
            }
            
            // Check confidence
            if (pred.score < CONFIG.yolo.confidenceThreshold) {
                return false;
            }
            
            // Check if object is within lane boundaries with margin
            if (STATE.leftLine && STATE.rightLine) {
                const margin = (STATE.rightLine - STATE.leftLine) * CONFIG.detection.lineMargin;
                const leftBound = STATE.leftLine - margin;
                const rightBound = STATE.rightLine + margin;
                
                const objCenterX = pred.bbox[0] + pred.bbox[2] / 2;
                
                if (objCenterX < leftBound || objCenterX > rightBound) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Estimate distance for each detection
        mobilePredictions.forEach(pred => {
            pred.estimatedDistance = estimateDistanceFromBBox(pred.bbox);
        });
        
        return mobilePredictions;
        
    } catch (error) {
        log(`YOLO detection error: ${error.message}`, 'error');
        return [];
    }
}

function estimateDistanceFromBBox(bbox) {
    // Simple distance estimation based on bounding box height
    // Larger objects are closer
    const height = bbox[3];
    const canvasHeight = DOM.canvas.height;
    
    // Calibrated formula: distance inversely proportional to object size
    const baseDistance = 200; // cm at full height
    const normalizedHeight = height / canvasHeight;
    const estimatedDistance = (baseDistance / normalizedHeight) * STATE.distanceCalibration;
    
    return Math.round(estimatedDistance);
}

// ==================== AUTONOMOUS DECISION MAKING ====================
function makeAutonomousDecision(lineDetection, signDetection, yoloDetections) {
    let targetSpeed = 50;
    let leftSpeed = targetSpeed;
    let rightSpeed = targetSpeed;
    let command = 'FORWARD';
    
    // Priority 1: Traffic Signs
    if (signDetection && signDetection.sign === 'STOP') {
        sendCommand('STOP', 0, 0);
        STATE.activeDetections.set('sign_stop', {
            type: 'STOP Sign',
            distance: '---',
            critical: true
        });
        log('STOP sign detected - halting', 'warning');
        
        // Resume after 2 seconds
        setTimeout(() => {
            if (STATE.autonomousMode) {
                log('Resuming from STOP', 'info');
            }
        }, 2000);
        return;
    }
    
    // Priority 2: Mobile Objects (YOLO)
    if (yoloDetections.length > 0) {
        const closestObject = yoloDetections.reduce((closest, obj) => 
            obj.estimatedDistance < closest.estimatedDistance ? obj : closest
        );
        
        STATE.estimatedDistance = closestObject.estimatedDistance;
        
        STATE.activeDetections.set('yolo_' + closestObject.class, {
            type: closestObject.class.toUpperCase(),
            distance: `${closestObject.estimatedDistance} cm`,
            critical: closestObject.estimatedDistance < STATE.safeDistance
        });
        
        // Distance-based speed control
        if (closestObject.estimatedDistance < STATE.safeDistance) {
            // STOP
            sendCommand('STOP', 0, 0);
            log(`Object too close: ${closestObject.estimatedDistance}cm - STOPPING`, 'error');
            return;
        } else if (closestObject.estimatedDistance < CONFIG.detection.slowdownDistance) {
            // SLOW DOWN
            targetSpeed = Math.max(20, targetSpeed * (closestObject.estimatedDistance / CONFIG.detection.slowdownDistance));
            log(`Object detected: ${closestObject.estimatedDistance}cm - SLOWING`, 'warning');
        } else if (closestObject.estimatedDistance < (STATE.followDistance + CONFIG.detection.followTolerance)) {
            // MAINTAIN DISTANCE
            const distanceError = closestObject.estimatedDistance - STATE.followDistance;
            targetSpeed = 50 + (distanceError * 2); // Proportional control
            targetSpeed = Math.max(20, Math.min(70, targetSpeed));
            log(`Following object at ${closestObject.estimatedDistance}cm`, 'info');
        }
    }
    
    // Priority 3: Lane Following
    if (lineDetection && lineDetection.detected) {
        const deviation = lineDetection.deviation;
        
        STATE.activeDetections.set('lane_follow', {
            type: 'Lane Centering',
            distance: `${Math.abs(deviation).toFixed(1)}% dev`,
            critical: false
        });
        
        // Steering correction based on deviation
        if (Math.abs(deviation) > 2) {
            if (deviation > 0) {
                // Need to turn right
                leftSpeed = targetSpeed;
                rightSpeed = targetSpeed * 0.7;
                command = 'RIGHT';
            } else {
                // Need to turn left
                leftSpeed = targetSpeed * 0.7;
                rightSpeed = targetSpeed;
                command = 'LEFT';
            }
        } else {
            // Centered
            leftSpeed = rightSpeed = targetSpeed;
            command = 'FORWARD';
        }
        
        DOM.zoneIndicator.textContent = `LANE CENTERED: ${deviation.toFixed(1)}%`;
    } else {
        // No lane detected - stop
        sendCommand('STOP', 0, 0);
        DOM.zoneIndicator.textContent = 'NO LANE DETECTED - HALTED';
        log('Lane lost - stopping', 'error');
        return;
    }
    
    // Send final command
    sendCommand(command, Math.round(leftSpeed), Math.round(rightSpeed));
    STATE.speed = Math.round((leftSpeed + rightSpeed) / 2);
}

// ==================== VISUALIZATION ====================
function visualizeLanes(lineDetection) {
    if (!lineDetection) return;
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    
    const height = DOM.canvas.height;
    const startY = Math.floor(height * 0.4);
    
    // Draw left line
    if (lineDetection.leftLine) {
        ctx.beginPath();
        ctx.moveTo(lineDetection.leftLine, startY);
        ctx.lineTo(lineDetection.leftLine, height);
        ctx.stroke();
    }
    
    // Draw right line
    if (lineDetection.rightLine) {
        ctx.beginPath();
        ctx.moveTo(lineDetection.rightLine, startY);
        ctx.lineTo(lineDetection.rightLine, height);
        ctx.stroke();
    }
    
    // Draw lane center
    if (lineDetection.laneCenter) {
        ctx.strokeStyle = '#00ffff';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(lineDetection.laneCenter, startY);
        ctx.lineTo(lineDetection.laneCenter, height);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
}

function visualizeTrafficSigns(signDetection) {
    if (!signDetection || !signDetection.sign) return;
    
    const width = DOM.canvas.width;
    const height = DOM.canvas.height;
    
    ctx.fillStyle = signDetection.sign === 'STOP' ? '#ff0000' : '#00ff00';
    ctx.font = 'bold 40px Orbitron';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 20;
    ctx.fillText(signDetection.sign, width * 0.7, height * 0.2);
    ctx.shadowBlur = 0;
}

function visualizeYOLODetections(detections) {
    detections.forEach(detection => {
        const [x, y, w, h] = detection.bbox;
        const distance = detection.estimatedDistance;
        
        // Color based on distance
        let color = '#00ff00';
        if (distance < STATE.safeDistance) {
            color = '#ff0000';
        } else if (distance < CONFIG.detection.slowdownDistance) {
            color = '#ffff00';
        }
        
        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        
        // Draw label
        ctx.fillStyle = color;
        ctx.font = 'bold 16px Rajdhani';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 5;
        const label = `${detection.class} ${distance}cm`;
        ctx.fillText(label, x, y - 10);
        ctx.shadowBlur = 0;
    });
}

// ==================== UI UPDATES ====================
function updateTelemetry() {
    DOM.motorLeft.textContent = `${STATE.motorLeft}%`;
    DOM.motorRight.textContent = `${STATE.motorRight}%`;
    DOM.direction.textContent = STATE.currentDirection;
    DOM.speed.textContent = STATE.speed;
    
    if (STATE.estimatedDistance) {
        DOM.distance.textContent = `${STATE.estimatedDistance} cm`;
    } else if (STATE.ultrasonicDistance) {
        DOM.distance.textContent = `${STATE.ultrasonicDistance} cm`;
    } else {
        DOM.distance.textContent = '---';
    }
}

function updateFPS() {
    STATE.frameCount++;
    const now = performance.now();
    const elapsed = now - STATE.lastFrameTime;
    
    if (elapsed >= 1000) {
        STATE.fps = Math.round((STATE.frameCount * 1000) / elapsed);
        DOM.fps.textContent = STATE.fps;
        STATE.frameCount = 0;
        STATE.lastFrameTime = now;
    }
}

function updateDetectionDisplay() {
    let html = '';
    let count = 0;
    
    STATE.activeDetections.forEach((detection, key) => {
        count++;
        const criticalClass = detection.critical ? ' critical' : '';
        html += `
            <div class="detection-item${criticalClass}">
                <span>${detection.type}</span>
                <span class="detection-distance">${detection.distance}</span>
            </div>
        `;
    });
    
    if (count === 0) {
        html = '<div style="color: rgba(0,255,0,0.5); text-align: center;">NO DETECTIONS</div>';
    }
    
    DOM.detectionDisplay.innerHTML = html;
    DOM.detectionCount.textContent = count;
}

function updateColorSelection() {
    STATE.selectedColors = [];
    document.querySelectorAll('input[name="lineColor"]:checked').forEach(checkbox => {
        STATE.selectedColors.push(checkbox.value);
        checkbox.parentElement.classList.add('selected');
    });
    
    document.querySelectorAll('input[name="lineColor"]:not(:checked)').forEach(checkbox => {
        checkbox.parentElement.classList.remove('selected');
    });
    
    log(`Colors: ${STATE.selectedColors.join(', ')}`, 'info');
}

// ==================== LOGGING ====================
function log(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];
    
    entry.innerHTML = `
        <span class="log-timestamp">[${timestamp}]</span>
        <span>${message}</span>
    `;
    
    DOM.eventLog.insertBefore(entry, DOM.eventLog.firstChild);
    
    // Limit to 100 entries
    while (DOM.eventLog.children.length > 100) {
        DOM.eventLog.removeChild(DOM.eventLog.lastChild);
    }
}

function clearLog() {
    DOM.eventLog.innerHTML = '<div class="log-entry success"><span class="log-timestamp">[00:00:00]</span><span>LOG CLEARED</span></div>';
}

// ==================== ERROR HANDLING ====================
window.addEventListener('error', (event) => {
    log(`ERROR: ${event.message}`, 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    log(`PROMISE ERROR: ${event.reason}`, 'error');
});
