import * as THREE from 'three';

export function initializeScene(container) {
  console.log('🎮 [SceneSetup] Starting scene initialization...');
  
  try {
    console.log('🎮 [SceneSetup] Creating scene...');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    console.log('✅ [SceneSetup] Scene created successfully');

    console.log('🎮 [SceneSetup] Creating camera...');
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    console.log('✅ [SceneSetup] Camera created successfully');

    console.log('🎮 [SceneSetup] Creating renderer...');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x1a1a2e);
    console.log('✅ [SceneSetup] Renderer created successfully');
    
    console.log('🎮 [SceneSetup] Appending renderer to container...');
    if (!container) {
      throw new Error('Container is null or undefined');
    }
    container.appendChild(renderer.domElement);
    console.log('✅ [SceneSetup] Renderer appended to DOM');

    // Lighting setup
    console.log('🎮 [SceneSetup] Setting up lighting...');
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    console.log('✅ [SceneSetup] Ambient light added');

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);
    console.log('✅ [SceneSetup] Directional light added');

    // Additional lighting for better visibility
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x1a1a2e, 0.3);
    scene.add(hemisphereLight);
    console.log('✅ [SceneSetup] Hemisphere light added');

    // Point lights for dramatic effect
    const pointLight1 = new THREE.PointLight(0x4169e1, 0.5, 30);
    pointLight1.position.set(8, 8, 8);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4169e1, 0.5, 30);
    pointLight2.position.set(-8, 8, -8);
    scene.add(pointLight2);
    console.log('✅ [SceneSetup] Point lights added');

    // Camera position
    console.log('🎮 [SceneSetup] Setting camera position...');
    camera.position.set(0, 12, 15);
    camera.lookAt(0, 2.5, 0);
    console.log('✅ [SceneSetup] Camera positioned');

    // Create simple controls (we'll add OrbitControls later if needed)
    console.log('🎮 [SceneSetup] Setting up basic controls...');
    const controls = null; // Simplified for now
    console.log('✅ [SceneSetup] Basic controls set up');

    console.log('🎉 [SceneSetup] Scene setup complete!');
    return { scene, camera, renderer, controls };
    
  } catch (error) {
    console.error('❌ [SceneSetup] Error during scene initialization:', error);
    console.error('❌ [SceneSetup] Error stack:', error.stack);
    throw error;
  }
}