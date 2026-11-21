import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './style.css';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Create the scene: the 3D world that will contain our objects.
const scene = new THREE.Scene();
scene.background = new THREE.Color('#090b12');

// 2. Create a camera: this is the viewpoint looking into the scene.
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 0, 6);


// 3. Create the renderer: Three.js uses WebGL to draw the scene.
const container = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Zoom limits
controls.minDistance = 2;
controls.maxDistance = 15;

// Camera movement
controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;
const composer = new EffectComposer(renderer);

composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.3,  // Strength
  0.5,  // Radius
  0.2   // Threshold
);

composer.addPass(bloomPass);

// Create a group to hold our imported model
const modelGroup = new THREE.Group();
scene.add(modelGroup);

// Load the Blender model
const loader = new GLTFLoader();

loader.load(
  '/models/my-model.glb',

  (gltf) => {
    const model = gltf.scene;

    // Find the model's dimensions
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Centre and automatically scale the model
    const maxDimension = Math.max(size.x, size.y, size.z);
    model.position.sub(center);
    model.scale.setScalar(2.2 / maxDimension);

    modelGroup.add(model);

    console.log('Model loaded successfully!');
  },

  undefined,

  (error) => {
    console.error('Error loading model:', error);
  }
);
// 5. Add lights so the material has highlights and shading.
const ambientLight = new THREE.AmbientLight('#aab4ff', 1.1);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight('#ffffff', 3.2);
keyLight.position.set(3, 4, 5);
scene.add(keyLight);

const rimLight = new THREE.PointLight('#6677ff', 22, 12);
rimLight.position.set(-3, -1, -2);
scene.add(rimLight);

// A subtle wireframe sphere behind the cube adds depth to the composition.
const ringGeometry = new THREE.TorusGeometry(2.35, 0.004, 8, 120);
const ringMaterial = new THREE.MeshBasicMaterial({
  color: '#6875b9',
  transparent: true,
  opacity: 0.32,
});
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = 1.12;
ring.rotation.y = 0.25;
scene.add(ring);

// Resize the drawing area while keeping the camera's proportions correct.
function resize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);
}
const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(container);
resize();
// Mouse/touch drag interaction.

container.addEventListener('pointerdown', (event) => {
  isDragging = true;
  previousX = event.clientX;
  previousY = event.clientY;
  container.setPointerCapture(event.pointerId);
});

container.addEventListener('pointermove', (event) => {
  if (!isDragging) return;
  const deltaX = event.clientX - previousX;
  const deltaY = event.clientY - previousY;
  targetRotationY += deltaX * 0.008;
  targetRotationX += deltaY * 0.008;
  previousX = event.clientX;
  previousY = event.clientY;
});

function stopDragging() { isDragging = false; }
container.addEventListener('pointerup', stopDragging);
container.addEventListener('pointercancel', stopDragging);
container.addEventListener('lostpointercapture', stopDragging);
// Static reference grid
const grid = new THREE.GridHelper(
  20,       // Total grid size
  40,       // Number of divisions
  0x6875b9, // Centre line colour
  0x30364d  // Grid line colour
);

grid.position.y = -1.5;
scene.add(grid);
// 6. Render continuously: this loop runs once for every animation frame.
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  // Update camera controls
  controls.update();

  // Optional: keep the decorative ring rotating
 

  // Render the scene with bloom
  composer.render();
}

animate();
