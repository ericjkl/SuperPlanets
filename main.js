import './style.css';
import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry';
import { Vector2 } from "three";
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
controls.onAmbientLightingBrightnessChange = () => {
  ambientLight.intensity = controls.ambientLightingBrightness
}

// Helpers

const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200, 50);
controls.scene.add(lightHelper)

controls.flyControls.addEventListener("change", function moveSpaceship() {
  if (controls.spaceShipAktivated == true) {
    var direction = new THREE.Vector3();
    controls.camera.getWorldDirection(direction);
    console.log(controls.scene.children[controls.spaceShipId])

    controls.scene.children[controls.spaceShipId].position.x = controls.camera.position.x + (direction.x * 10)
    controls.scene.children[controls.spaceShipId].position.y = controls.camera.position.y + (direction.y * 10)
    controls.scene.children[controls.spaceShipId].position.z = controls.camera.position.z + (direction.z * 10)


    // controls.scene.children[controls.spaceShipId].rotation.x = controls.camera.rotation.x;
    // controls.scene.children[controls.spaceShipId].rotation.y = controls.camera.rotation.y;
    // controls.scene.children[controls.spaceShipId].rotation.z = controls.camera.rotation.z;
  }
})

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
  return { ref: comet, initialPosition: { x: x, y: y, z: z } }
}
const comets = []
for (let i = 0; i < controls.meteoriteAmount; i++) {
  comets.push(addComet());
}

controls.onMeteoriteAmountChange = () => {
  const difference = controls.meteoriteAmount - comets.length
  if (difference > 0) {
    for (let i = 0; i < difference; i++) {
      comets.push(addComet())
    }
  } else {
    const deleted = comets.splice(comets.length + difference, -difference)
    deleted.forEach((el) => {
      controls.scene.remove(el.ref)
    })
  }
}

function updateComets(t) {
  comets.forEach(({ ref, initialPosition }, i) => {
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

// const geometry = new THREE.BoxGeometry(5, 5, 5);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// cube.position.x = 0;
// cube.position.y = 0;
// cube.position.z = 0;
// cube.name = "raumschiff";
// controls.scene.add(cube);

const spaceship = new Planet({
  gltfPath: 'assets/licht5.glb',
  initialScale: 100,
}, controls.scene)


// var ballGeo = new THREE.SphereGeometry(10, 35, 35);
// var material = new THREE.MeshPhongMaterial({ color: 0xF7FE2E });
// var ball = new THREE.Mesh(ballGeo, material);

// var pendulumGeo = new THREE.CylinderGeometry(1, 1, 50, 16);
// ball.updateMatrix();
// pendulumGeo.merge(ball.geometry, ball.matrix);

// var pendulum = new THREE.Mesh(pendulumGeo, material);
// controls.scene.add(pendulum);


// const earth = new Planet({
//   gltfPath: 'assets/earth.glb',
//   initialScale: 1000,
//   castShadow: true,
//   receiveShadow: true,
// }, controls.scene)


// x

//teapot
// const teapotGeometry = new TeapotGeometry(20, 16);
// const teapotMaterial = new THREE.MeshPhongMaterial({
//   color: 0xFF0000,
//   shininess: 500,
// });
// const teapot = new THREE.Mesh(teapotGeometry, teapotMaterial);
// teapot.position.x = 250;
// teapot.position.y = 0;
// teapot.position.z = -120;
// controls.scene.add(teapot);


controls.runAnimation(animate)
function animate() {
  const t = controls.animationDriver

  moon.ref.rotation.x = t * 2;
  mars.ref.rotation.y = t / 5;
  //teapot
  // teapot.rotation.y = t / 2;
  // teapot.rotation.x = t / 2;

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
