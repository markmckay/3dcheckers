import * as THREE from 'three';

export function initializeScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x1a1a2e);
  
  container.appendChild(renderer.domElement);

  // Lighting setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

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

  // Additional lighting for better visibility
  const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x1a1a2e, 0.3);
  scene.add(hemisphereLight);

  // Point lights for dramatic effect
  const pointLight1 = new THREE.PointLight(0x4169e1, 0.5, 30);
  pointLight1.position.set(8, 8, 8);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x4169e1, 0.5, 30);
  pointLight2.position.set(-8, 8, -8);
  scene.add(pointLight2);

  // Camera position
  camera.position.set(0, 12, 15);
  camera.lookAt(0, 2.5, 0);

  // Import OrbitControls dynamically
  import('three/examples/jsm/controls/OrbitControls').then(({ OrbitControls }) => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 8;
    controls.maxDistance = 25;
  });

  return { scene, camera, renderer, controls: null };
}