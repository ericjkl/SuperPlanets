import './style.css';
import * as THREE from 'three';
import {TeapotGeometry} from 'three/examples/jsm/geometries/TeapotGeometry';
import {MeshBasicMaterial, Raycaster, Sphere, Vector2, Vector3} from "three";
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
pointLight.position.x = 0;
pointLight.position.z = 0;

const ambientLight = new THREE.AmbientLight(0x2a2a2a);
controls.scene.add(pointLight, ambientLight);
controls.onAmbientLightingBrightnessChange = () => {
    ambientLight.intensity = controls.ambientLightingBrightness
}

controls.flyControls.addEventListener("change", function moveSpaceship() {
    if (controls.spaceshipActive === true) {
        let direction = new THREE.Vector3();
        controls.camera.getWorldDirection(direction);
        spaceship.position.x = controls.camera.position.x + (direction.x * 10)
        spaceship.position.y = controls.camera.position.y + (direction.y * 10)
        spaceship.position.z = controls.camera.position.z + (direction.z * 10)

        spaceship.rotation.x = controls.camera.rotation.x
        spaceship.rotation.y = controls.camera.rotation.y - Math.PI;
        spaceship.rotation.z = controls.camera.rotation.z
    }
})

/**
 * @param {Array} target - Target array variable to push new comet into
 * @returns {undefined}
 * creates a new comet
 */
function addComet(target) {
    const [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(400));

    const raycaster = new Raycaster(new Vector3(x, y, z), new Vector3(1, 1, 0).normalize());
    let intersectionPoint = new Vector3()
    raycaster.ray.intersectSphere(saturnSphere, intersectionPoint)

    const comet = new Planet({
        gltfPath: "assets/comet-explosion.glb",
        initialScale: 0.3,
        initialPosition: {x: x, y: y, z: z}
    }, controls.scene, () => {
        target.push({
            comet: comet,
            initialPosition: { x: x, y: y, z: z },
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

/**
 * @returns {undefined}
 * updates the comet animations for each comet
 */
function updateComets() {
    comets.forEach(({ comet, initialPosition, intersectionPoint }, i) => {
        if (comet.ref.position.x > 300 || comet.ref.position.y > 300 || comet.ref.position.z > 300) {
            comet.ref.position.x = initialPosition.x
            comet.ref.position.y = initialPosition.y
            comet.ref.position.z = initialPosition.z
        } else if (!(intersectionPoint && comet.ref.position.distanceTo(intersectionPoint) <= 5)) {
            comet.ref.position.x += controls.animationStep * 20
            comet.ref.position.y += controls.animationStep * 20
        } else {
            controls.addMixer(comet, () => {
                controls.scene.remove(comet.ref)
                addComet(comets)
            })
            comets.splice(i, 1)
        }
    });
}

// Planets

const sun = new Planet({
    radius: 50,
    mapPath: 'assets/sun.jpg',
    segmentCount: 64,
    material: MeshBasicMaterial,
    initialPosition: {
        x: 0,
        y: 0,
        z: 0
    }
}, controls.scene)

const saturn = new Planet({
    radius: 30,
    mapPath: 'assets/8k_saturn.jpg',
    segmentCount: 64,
    castShadow: true,
    receiveShadow: true,
    initialPosition: {
        x: 175,
        y: 0,
        z: 0
    }
}, controls.scene)
const saturnSphere = new Sphere(saturn.ref.position, 30)

const venus = new Planet({
    radius: 30,
    mapPath: 'assets/8k_venus_surface.jpg',
    segmentCount: 64,
    castShadow: true,
    receiveShadow: true,
    initialPosition: {
        x: 50,
        y: 0,
        z: 250
    }
}, controls.scene)

const mars = new Planet({
    radius: 20,
    mapPath: 'assets/mars-8k.jpg',
    normalMapPath: 'assets/mars-normal.png',
    segmentCount: 64,
    castShadow: true,
    receiveShadow: true,
    initialPosition: {
        x: -50,
        y: 0,
        z: -250
    }
}, controls.scene)

const moon = new Planet({
    radius: 3,
    mapPath: 'assets/eris.jpg',
    segmentCount: 64,
    castShadow: true,
    receiveShadow: true,
    initialPosition: {
        x: venus.ref.position + 20,
        y: 0,
        z: venus.ref.position + 50
    }
}, controls.scene)

const spaceship = new THREE.Group();
const spaceshipModel = new Planet({
    gltfPath: 'assets/spaceship.glb',
}, false, () => {
    const spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI/64);
    spaceship.add(spotLight);
    spaceship.add(spaceshipModel.ref);

    controls.scene.add(spaceship);
    spaceship.position.x = 100
    spaceship.position.z = -100

    spotLight.rotation.x = -Math.PI / 2
    spotLight.position.x += 1.5
    spotLight.position.y -= 1
    spotLight.position.z += 3

    const secondSpotLight = spotLight.clone()
    spaceship.add(secondSpotLight)

    secondSpotLight.position.x = - spotLight.position.x

    const geometry = new THREE.ConeGeometry(3, 50, 32, 1, true);
    const material = new THREE.ShaderMaterial({
        transparent: true,
        opacity: 0.1,
        uniforms: {
            color: {
                value: new THREE.Color("white")
            },
        },
        vertexShader: `
            varying vec2 vUv;
        
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying vec2 vUv;
            float a = 3.0;
            
            void main() {
                float alpha = smoothstep(0.0, 1.0, vUv.y);
                gl_FragColor = vec4(color, alpha/a);
            }
        `,
    });
    const cone = new THREE.Mesh(geometry, material);
    spaceship.add(cone);
    cone.position.set(spotLight.position.x, spotLight.position.y, spotLight.position.z+23)
    cone.rotation.set(spotLight.rotation.x, spotLight.rotation.y, spotLight.rotation.z)
    const secondCone = cone.clone()
    spaceship.add(secondCone);
    secondCone.position.x = - cone.position.x
    spaceship.scale.set(0.5, 0.5, 0.5)
})

//teapot
const teapotGeometry = new TeapotGeometry(1, 16);
const teapotMaterial = new THREE.MeshPhongMaterial({
    color: 0xFF0000,
    shininess: 500,
});
const teapot = new THREE.Mesh(teapotGeometry, teapotMaterial);
teapot.position.x = mars.ref.position.x;
teapot.position.y = mars.ref.position.y;
teapot.position.z = mars.ref.position.z;
teapot.castShadow = true;
teapot.receiveShadow = true;
controls.scene.add(teapot);

const rings = [[35, 40, "#d8ae6d", 0.1, "ring1.jpg"], [35, 40, "#d8ae6d", 0.2, "ring1.jpg"], [41, 47, "#d8ae6d", 0.3, "ring1.jpg"], [48, 58, "#655f45", 0.3, "ring1.jpg"], [59, 65, "#ffe1ab", 0.2, "ring1.jpg"], [66, 69, "#d8ae6d", 0.1, "ring1.jpg"]]
for (let i = 0; i < rings.length; i++) {
    const texture = new THREE.TextureLoader().load('assets/' + rings[i][4]);

    const geometry = new THREE.RingGeometry(rings[i][0], rings[i][1], 64);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: rings[i][3]
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 175;
    mesh.position.y = 0;
    mesh.position.z = 0;
    mesh.rotation.x = 1.3
    controls.scene.add(mesh)
}

const comets = []
for (let i = 0; i < controls.meteoriteAmount; i++) {
    addComet(comets)
}

controls.runAnimation(()=>{
    const t = controls.animationDriver

    moon.ref.rotation.x = t * 2;
    mars.ref.rotation.y = t / 5;
    saturn.ref.rotation.y = t / 5;
    saturn.ref.rotation.y = t / 5;
    venus.ref.rotation.y = t / 5;
    venus.ref.rotation.y = t / 5;
    sun.ref.rotation.y = t / 5;
    sun.ref.rotation.y = t / 5;
    teapot.rotation.y = t / 4;
    teapot.rotation.x = t / 4;

    let alpha = Math.PI * t * 3
    let beta = Math.PI * t * 0.05

    teapot.position.set(
        mars.ref.position.x + Math.cos(alpha) * 28,
        mars.ref.position.y + Math.sin(beta) * Math.sin(alpha) * 28,
        mars.ref.position.z + Math.cos(beta) * Math.sin(alpha) * 28,
    )

    moon.ref.position.set(
        venus.ref.position.x + (Math.sin(Math.PI * t / 5) * 50),
        venus.ref.position.y,
        venus.ref.position.z + (Math.cos(Math.PI * t / 5) * 50),
    )

    updateComets()
})
