import * as THREE from 'three';
import './style.css';

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

// 4. Build a cube from geometry (shape) and material (surface appearance).
const geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
const material = new THREE.MeshStandardMaterial({
  color: '#8494ff',
  metalness: 0,
  roughness: 0,
});
const cube = new THREE.Mesh(geometry, material);
cube.rotation.set(0.35, 0.55, 0);
scene.add(cube);

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
}
const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(container);
resize();

// Mouse/touch drag interaction.
let isDragging = false;
let previousX = 0;
let previousY = 0;
let targetRotationX = cube.rotation.x;
let targetRotationY = cube.rotation.y;

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

// 6. Render continuously: this loop runs once for every animation frame.
const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();

  if (!isDragging) targetRotationY += 0.0025;

  cube.rotation.x = THREE.MathUtils.lerp(cube.rotation.x, targetRotationX, 0.08);
  cube.rotation.y = THREE.MathUtils.lerp(cube.rotation.y, targetRotationY, 0.08);
  ring.rotation.z = elapsed * 0.08;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
