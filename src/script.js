import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};

const galaxyAttributes = {
  geometry: undefined,
  positions: undefined,
  colors: undefined,
  material: undefined,
  points: undefined,
};

const calculateRandomness = (randomBase, radius) =>
  Math.pow(randomBase, parameters.randomnessPower) *
  (Math.random() < 0.5 ? 1 : -1) *
  parameters.randomness *
  radius;

const generateGalaxy = (attributes) => {
  if (attributes.points) {
    attributes.geometry.dispose();
    attributes.material.dispose();
    scene.remove(attributes.points);
  }

  //Geometry

  attributes.geometry = new THREE.BufferGeometry();
  attributes.positions = new Float32Array(parameters.count * 3);
  attributes.colors = new Float32Array(parameters.count * 3);
  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);
  for (let i = 0; i < parameters.count; i++) {
    //We have to populate the array in chunks of 3
    // because each vertex has 3 components (x, y, z)
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;
    // The further away from the center, give more spin

    const spinAngle = radius * parameters.spin;

    const randomX = calculateRandomness(Math.random(), radius);

    const randomY = calculateRandomness(Math.random(), radius);

    const randomZ = calculateRandomness(Math.random(), radius);

    const branchAngle =
      (Math.PI * 2 * (i % parameters.branches)) / parameters.branches;

    attributes.positions[i3] =
      Math.cos(branchAngle + spinAngle) * radius + randomX; // x
    attributes.positions[i3 + 1] = randomY; // y
    attributes.positions[i3 + 2] =
      Math.sin(branchAngle + spinAngle) * radius + randomZ; // z

    // colors
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);
    attributes.colors[i3] = mixedColor.r;
    attributes.colors[i3 + 1] = mixedColor.g;
    attributes.colors[i3 + 2] = mixedColor.b;
  }
  // We need to tell the geometry how to interpret the data
  // In this case, we want to interpret the data as vertices of 3 parts

  attributes.geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(attributes.positions, 3)
  );
  attributes.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(attributes.colors, 3)
  );

  //Material
  attributes.material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  // Points
  attributes.points = new THREE.Points(
    attributes.geometry,
    attributes.material
  );
  scene.add(attributes.points);
};

generateGalaxy(galaxyAttributes);

gui
  .add(parameters, "count")
  .min(100)
  .max(1000000)
  .step(100)

  .onFinishChange(() => generateGalaxy(galaxyAttributes));

gui
  .add(parameters, "size")
  .min(0.01)
  .max(0.1)
  .step(0.001)
  .onFinishChange(() => generateGalaxy(galaxyAttributes));

gui
  .add(parameters, "radius")
  .min(0.1)
  .max(20)
  .step(0.1)
  .onFinishChange(() => generateGalaxy(galaxyAttributes));

gui
  .add(parameters, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(() => generateGalaxy(galaxyAttributes));

gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(() => generateGalaxy(galaxyAttributes));

gui
  .add(parameters, "randomness")
  .min(0)
  .max(5)
  .step(0.001)
  .onFinishChange(() => generateGalaxy(galaxyAttributes));

gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(() => generateGalaxy(galaxyAttributes));
gui
  .addColor(parameters, "insideColor")
  .onFinishChange(() => generateGalaxy(galaxyAttributes));
gui
  .addColor(parameters, "outsideColor")
  .onFinishChange(() => generateGalaxy(galaxyAttributes));
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
