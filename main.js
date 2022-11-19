import './style.css';
import * as THREE from 'three';
import {FlyControls} from 'three/examples/jsm/controls/FlyControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshBasicMaterial, MeshPhongMaterial, Raycaster, Sphere, Vector2, Vector3} from "three";
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

// const controls = new OrbitControls(camera, renderer.domElement);

function addComet(target) {
    /*const geometry = new THREE.SphereGeometry(0.4, 24, 24);
    const material = new THREE.MeshStandardMaterial({color: 0xffffff});
    const comet = new THREE.Mesh(geometry, material);*/
    const [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(300));

    const raycaster = new Raycaster(new Vector3(x, y, z), new Vector3(1, 1, 0).normalize());
    let intersectionPoint = new Vector3()
    raycaster.ray.intersectSphere(marsSphere, intersectionPoint)

    const comet = new Planet({
        gltfPath: "assets/comet-explosion.glb",
        initialScale: 0.3,
        initialPosition: {x: x, y: y, z: z}
    }, controls.scene, ()=>{
        target.push( {
            comet: comet,
            initialPosition: {x: x, y: y, z: z},
            intersectionPoint: intersectionPoint
        })
    })
}

controls.onMeteoriteAmountChange = () => {
    const difference = controls.meteoriteAmount - comets.length
    if (difference > 0) {
        for (let i = 0; i < difference; i++) {
            addComet(comets)
        }
    } else {
        const deleted = comets.splice(comets.length + difference, -difference)
        deleted.forEach((el) => {
            controls.scene.remove(el.ref)
        })
    }
}

function updateComets(t) {
    comets.forEach(({comet, initialPosition, intersectionPoint}, i) => {
        if (comet.ref.position.x > 300 || comet.ref.position.y > 300 || comet.ref.position.z > 300) {
            comet.ref.position.x = initialPosition.x
            comet.ref.position.y = initialPosition.y
            comet.ref.position.z = initialPosition.z
        } else if (!(intersectionPoint && comet.ref.position.distanceTo(intersectionPoint) <= 5)) {
            comet.ref.position.x += controls.animationStep * 20
            comet.ref.position.y += controls.animationStep * 20
        } else {
            controls.addMixer(comet, ()=>{
                controls.scene.remove(comet.ref)
                addComet(comets)
            })
            comets.splice(i, 1)
        }
    });
}

// Planets
const mars = new Planet({
    radius: 40,
    mapPath: 'assets/mars-8k.jpg',
    normalMapPath: 'assets/mars-normal.png',
    segmentCount: 64,
    castShadow: true,
    receiveShadow: true,
    initialPosition: {
        x: 110,
        y: 0,
        z: -200
    }
}, controls.scene)
const marsSphere = new Sphere(mars.ref.position, 40)

const moon = new Planet({
    radius: 5,
    mapPath: 'assets/eris.jpg',
    segmentCount: 64,
    castShadow: true,
    receiveShadow: true,
    initialPosition: {
        x: mars.ref.position + 20,
        y: 0,
        z: mars.ref.position + 50
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

const sun = new Planet({
    radius: 100,
    mapPath: 'assets/sun.jpg',
    segmentCount: 64,
    material: MeshBasicMaterial
}, controls.scene)

const comets = []
for (let i = 0; i < controls.meteoriteAmount; i++) {
    addComet(comets)
}

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
