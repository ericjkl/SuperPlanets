import './style.css';
import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Vector2} from "three";
import Planet from "./classes/Planet";
import Control from "./classes/Control";

// Setup
const controls = new Control()
controls.render()

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.castShadow = true;
pointLight.shadow.mapSize = new Vector2(3000, 3000)
pointLight.shadow.radius = 10;
pointLight.position.x = -150;
pointLight.position.z = 150;

const ambientLight = new THREE.AmbientLight(0x2a2a2a);
controls.scene.add(pointLight, ambientLight);

// Helpers

const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50);
controls.scene.add(lightHelper)

// const controls = new OrbitControls(camera, renderer.domElement);

function addComet() {
  const geometry = new THREE.SphereGeometry(0.4, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const comet = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(500));

  comet.position.set(x, y, z);
  controls.scene.add(comet);
  return {ref: comet, initialPosition: {x: x, y: y, z: z}}
}
const comets = []
for (let i = 0; i < controls.meteoriteAmount; i++) {
  comets.push(addComet());
}

function updateComets(t) {
  comets.forEach(({ref, initialPosition}, i)=>{
    const comet = ref
    if (comet.position.x > 300 || comet.position.y > 300 || comet.position.z > 300) {
      comet.position.x = initialPosition.x
      comet.position.y = initialPosition.y
      comet.position.z = initialPosition.z
    } else {
      comet.position.x += controls.animationStep * 20
      comet.position.y += controls.animationStep * 20
    }
  });
}

// Planets
const earth = new Planet({
  gltfPath: 'assets/earth.glb',
  initialScale: 10
}, controls.scene)

const moon = new Planet({
  radius: 5,
  mapPath: 'assets/eris.jpg',
  segmentCount: 64,
  castShadow: true,
  receiveShadow: true,
  initialPosition: {
    x: 35,
    y: 0,
    z: -50
  }
}, controls.scene)

const mars = new Planet({
  radius: 50,
  mapPath: 'assets/mars-8k.jpg',
  normalMapPath: 'assets/mars-normal.png',
  segmentCount: 64,
  castShadow: true,
  receiveShadow: true,
  initialPosition: {
    x: 55,
    y: 0,
    z: -100
  }
}, controls.scene)

const ioMoon = new Planet({
  radius: 1,
  mapPath: 'assets/io.jpg',
  segmentCount: 64,
  castShadow: true,
  receiveShadow: true,
  initialPosition: {
    x: mars.ref.position.x,
    y: mars.ref.position.y,
    z: mars.ref.position.z
  }
}, controls.scene)

controls.runAnimation(animate)
function animate() {
  const t = controls.animationDriver

  moon.ref.rotation.x = t * 2;
  mars.ref.rotation.y = t / 5;

  let alpha = Math.PI * t * 3
  let beta = Math.PI * t * 0.05
  ioMoon.ref.position.set(
      mars.ref.position.x + Math.cos(alpha) * 58,
      mars.ref.position.y + Math.sin(beta) * Math.sin(alpha) * 58,
      mars.ref.position.z + Math.cos(beta) * Math.sin(alpha) * 58
  )

  moon.ref.position.set(
      mars.ref.position.x + (Math.sin(Math.PI * t / 5) * 80),
      mars.ref.position.y,
      mars.ref.position.z + (Math.cos(Math.PI * t / 5) * 80),
  )

  updateComets(t)
}
