// Game variables
let scene, camera, renderer, car, track;
let speed = 0;
let maxSpeed = 200;
let acceleration = 0.2;
let deceleration = 0.1;
let rotationSpeed = 0.05;
let keys = {};
let raceStarted = false;

// Initialize the game
function init() {
    // Set up Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('game-canvas'),
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create track
    createTrack();
    
    // Create car
    createCar();
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.getElementById('start-btn').addEventListener('click', startRace);
    
    // Start animation loop
    animate();
}

function createTrack() {
    // Simple rectangular track
    const trackGeometry = new THREE.PlaneGeometry(50, 30);
    const trackMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        side: THREE.DoubleSide
    });
    track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);
    
    // Add track borders
    const borderMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const borders = [
        new THREE.Mesh(new THREE.BoxGeometry(50, 1, 1), borderMaterial), // Top
        new THREE.Mesh(new THREE.BoxGeometry(50, 1, 1), borderMaterial), // Bottom
        new THREE.Mesh(new THREE.BoxGeometry(1, 1, 30), borderMaterial), // Left
        new THREE.Mesh(new THREE.BoxGeometry(1, 1, 30), borderMaterial)  // Right
    ];
    
    borders[0].position.set(0, 0, 15);
    borders[1].position.set(0, 0, -15);
    borders[2].position.set(-25, 0, 0);
    borders[3].position.set(25, 0, 0);
    
    borders.forEach(border => scene.add(border));
}

function createCar() {
    const carGeometry = new THREE.BoxGeometry(2, 1, 3);
    const carMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        metalness: 0.5,
        roughness: 0.7
    });
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.y = 0.5;
    scene.add(car);
}

function startRace() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('hud').classList.remove('hidden');
    raceStarted = true;
}

function onKeyDown(event) {
    keys[event.key] = true;
}

function onKeyUp(event) {
    keys[event.key] = false;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateCar() {
    if (!raceStarted) return;
    
    // Acceleration/Deceleration
    if (keys['ArrowUp'] || keys['w']) {
        speed = Math.min(speed + acceleration, maxSpeed);
    } else if (keys['ArrowDown'] || keys['s']) {
        speed = Math.max(speed - acceleration, -maxSpeed/2);
    } else {
        // Natural deceleration
        if (speed > 0) speed = Math.max(speed - deceleration, 0);
        else if (speed < 0) speed = Math.min(speed + deceleration, 0);
    }
    
    // Steering
    if ((keys['ArrowLeft'] || keys['a']) && Math.abs(speed) > 0.1) {
        car.rotation.y += rotationSpeed * (speed > 0 ? 1 : -1);
    }
    if ((keys['ArrowRight'] || keys['d']) && Math.abs(speed) > 0.1) {
        car.rotation.y -= rotationSpeed * (speed > 0 ? 1 : -1);
    }
    
    // Update car position based on speed and rotation
    car.position.x -= Math.sin(car.rotation.y) * speed * 0.05;
    car.position.z -= Math.cos(car.rotation.y) * speed * 0.05;
    
    // Update camera to follow car
    camera.position.x = car.position.x - Math.sin(car.rotation.y) * 10;
    camera.position.z = car.position.z - Math.cos(car.rotation.y) * 10;
    camera.lookAt(car.position);
    
    // Update HUD
    document.getElementById('speed').textContent = Math.abs(Math.round(speed));
}

function animate() {
    requestAnimationFrame(animate);
    updateCar();
    renderer.render(scene, camera);
}

// Start the game
init();