// Game variables
let scene, camera, renderer, car, track, directionalLight;
let timeOfDay = 0; // 0 = day, 1 = night
let dayNightCycleSpeed = 0.0005;
let environmentMeshes = [];
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
    scene.background = new THREE.Color(0x87CEEB); // Initial sky blue
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    
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
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Create environment
    createEnvironment();
    
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

function createEnvironment() {
    // Create trees with LOD
    const treeTrunkHighGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 4);
    const treeLeavesHighGeo = new THREE.SphereGeometry(1.5, 4, 4);
    const treeTrunkLowGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 3);
    const treeLeavesLowGeo = new THREE.SphereGeometry(1.5, 3, 3);
    
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const treeLeavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });

    // Create separate meshes for near and far trees
    const nearTreeTrunkMesh = new THREE.InstancedMesh(treeTrunkHighGeo, treeTrunkMat, 50);
    const nearTreeLeavesMesh = new THREE.InstancedMesh(treeLeavesHighGeo, treeLeavesMat, 50);
    const farTreeTrunkMesh = new THREE.InstancedMesh(treeTrunkLowGeo, treeTrunkMat, 50);
    const farTreeLeavesMesh = new THREE.InstancedMesh(treeLeavesLowGeo, treeLeavesMat, 50);
    
    let nearIndex = 0;
    let farIndex = 0;
    const LOD_DISTANCE = 15;
    
    for (let i = -20; i <= 20; i += 5) {
        for (let j = -12; j <= 12; j += 8) {
            const distance = Math.sqrt(i*i + j*j);
            const trunkMatrix = new THREE.Matrix4().makeTranslation(i, 1, j);
            const leavesMatrix = new THREE.Matrix4().makeTranslation(i, 3, j);
            
            if (distance < LOD_DISTANCE) {
                nearTreeTrunkMesh.setMatrixAt(nearIndex, trunkMatrix);
                nearTreeLeavesMesh.setMatrixAt(nearIndex, leavesMatrix);
                nearIndex++;
            } else {
                farTreeTrunkMesh.setMatrixAt(farIndex, trunkMatrix);
                farTreeLeavesMesh.setMatrixAt(farIndex, leavesMatrix);
                farIndex++;
            }
        }
    }
    
    scene.add(nearTreeTrunkMesh);
    scene.add(nearTreeLeavesMesh);
    scene.add(farTreeTrunkMesh);
    scene.add(farTreeLeavesMesh);

    // Optimize shadows (using the existing directionalLight reference)
    if (typeof directionalLight !== 'undefined') {
        directionalLight.shadow.mapSize.width = 512;
        directionalLight.shadow.mapSize.height = 512;
        directionalLight.shadow.camera.near = 1;
        directionalLight.shadow.camera.far = 50;
    } else {
        console.warn('Directional light not found for shadow optimization');
    }

    // Create simple buildings
    const buildingGeo = new THREE.BoxGeometry(3, 5, 3);
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
    
    for (let i = -22; i <= 22; i += 8) {
        const building = new THREE.Mesh(buildingGeo, buildingMat);
        building.position.set(i, 2.5, 18);
        scene.add(building);
        environmentMeshes.push(building);
    }
}

function updateDayNightCycle() {
    timeOfDay = (timeOfDay + dayNightCycleSpeed) % 1;
    
    // Interpolate between day and night colors
    const skyColor = new THREE.Color();
    skyColor.lerpColors(
        new THREE.Color(0x87CEEB), // Day
        new THREE.Color(0x000814), // Night
        timeOfDay
    );
    
    scene.background.copy(skyColor);
    scene.fog.color.copy(skyColor);
    
    // Adjust lighting
    const lightIntensity = 1 - (timeOfDay * 0.8);
    const lightColor = new THREE.Color();
    lightColor.lerpColors(
        new THREE.Color(0xffffff), // Day
        new THREE.Color(0xFFA500), // Night (warmer tone)
        timeOfDay
    );
    
    scene.children.forEach(child => {
        if (child instanceof THREE.DirectionalLight) {
            child.intensity = lightIntensity;
            child.color.copy(lightColor);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    updateCar();
    updateDayNightCycle();
    renderer.render(scene, camera);
}

// Handle WebGL context loss
function setupContextLossHandling() {
    renderer.domElement.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        console.warn('WebGL context lost. Attempting to recover...');
        setTimeout(init, 1000);
    }, false);

    renderer.domElement.addEventListener('webglcontextrestored', () => {
        console.log('WebGL context restored');
    }, false);
}

// Start the game
init();
setupContextLossHandling();
