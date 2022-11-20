import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { AnimationMixer, LoopOnce } from "three";
import { AnimationAction } from "three/src/animation/AnimationAction";

export default class Control {
    constructor() {
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.TextureLoader().load('assets/stars.jpg')
        this.camera = Control.#getCamera()
        this.renderer = Control.#getRenderer()
        this.flyControls = new FlyControls(this.camera, this.renderer.domElement)
        this.pauseCameraFly = true
        this.pauseAnimation = false
        this.animationDriver = 0
        this.animationStep = Control.#getInitialAnimationStep()
        this.initialAnimationStep = this.animationStep
        this.meteoriteAmount = 50
        this.onMeteoriteAmountChange = null;
        this.ambientLightingBrightness = 1;
        this.onAmbientLightingBrightnessChange = null;
        this.movementAcceleration = Control.#getInitialMovementAcceleration()
        this.mixers = [];
        this.#addListeners()
        this.spaceShipId = 0;
        this.spaceShipAktivated = false;
        this.keyPressed = false;
    }

    static #getInitialAnimationStep() { return 0.005 }

    static #getInitialMovementAcceleration() { return 0.5 }

    static #getCamera() {
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.y = 0;
        camera.position.x = 200;
        camera.position.z = 550;
        return camera
    }

    static #getRenderer() {
        const renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#bg'),
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true
        return renderer
    }

    #addListeners() {
        window.onkeydown = (event) => {
            // if (event.code === "KeyW") {
            //     this.scene.children[this.spaceShipId].rotation.x += Math.PI / 6;
            // } if (event.code === "KeyA") {
            //     this.scene.children[this.spaceShipId].rotation.y += Math.PI / 6;
            // } if (event.code === "KeyS") {
            //     this.scene.children[this.spaceShipId].rotation.x -= Math.PI / 6;
            // } if (event.code === "KeyD") {
            //     this.scene.children[this.spaceShipId].rotation.y -= Math.PI / 6;
            // }

            if (event.code === "KeyC") {
                this.pauseCameraFly = !this.pauseCameraFly
            }
            if (event.code === "KeyX") {
                const settings = document.getElementById("settings")
                if (settings.classList.contains("hidden")) {
                    settings.classList.remove("hidden");
                } else {
                    settings.classList.add("hidden");
                }
            }
            if (event.code === "Space") {
                this.pauseAnimation = !this.pauseAnimation
            }
            if (event.code === "KeyB") {
                this.pauseCameraFly = false
                if (this.spaceShipAktivated == false) {
                    for (let i = 0; i < this.scene.children.length; i++) {
                        if (this.scene.children[i].name == "Sketchfab_Scene") {
                            this.spaceShipId = i;
                        }
                    }
                    this.spaceShipAktivated = true;
                }

                else {
                    this.spaceShipAktivated = false;
                }
            }
            if (event.code === "KeyW" ||
                event.code === "KeyA" ||
                event.code === "KeyS" ||
                event.code === "KeyD") {
                this.movementAcceleration += Control.#getInitialMovementAcceleration() * (1 / this.movementAcceleration * 10) * 0.2
            }

            window.onkeyup = (event) => {
                console.log("key releasd");
                if (event.code === "KeyW" ||
                    event.code === "KeyA" ||
                    event.code === "KeyS" ||
                    event.code === "KeyD") {
                    this.movementAcceleration = Control.#getInitialMovementAcceleration()
                }

                // if (event.code === "KeyW") {
                //     this.scene.children[this.spaceShipId].rotation.x -= Math.PI / 6;
                // } if (event.code === "KeyA") {
                //     this.scene.children[this.spaceShipId].rotation.y -= Math.PI / 6;
                // } if (event.code === "KeyS") {
                //     this.scene.children[this.spaceShipId].rotation.x += Math.PI / 6;
                // } if (event.code === "KeyD") {
                //     this.scene.children[this.spaceShipId].rotation.y += Math.PI / 6;
                // }
            }

            const animationSpeedSlider = document.getElementById("animationSpeedSlider")
            animationSpeedSlider.oninput = () => {
                const initialAnimationStep = Control.#getInitialAnimationStep()
                const factor = animationSpeedSlider.value / 100
                const animationSpeed = factor > 1 ? factor ** 10 : factor
                this.animationStep = initialAnimationStep * animationSpeed
            }

            const meteoriteAmountSlider = document.getElementById("meteoriteAmountSlider")
            meteoriteAmountSlider.oninput = () => {
                this.meteoriteAmount = (meteoriteAmountSlider.value) ** 1.5 + 200
                this.onMeteoriteAmountChange()
            }

            const ambientBrightnessSlider = document.getElementById("ambientBrightnessSlider")
            ambientBrightnessSlider.oninput = () => {
                const factor = ambientBrightnessSlider.value
                this.ambientLightingBrightness = factor > 1 ? factor ** 4 : factor
                this.onAmbientLightingBrightnessChange()
            }
        }
    }

    addMixer(gltfObj, onFinished) {
        console.log("adding mixer");
        const mixer = new AnimationMixer(gltfObj.ref);
        gltfObj.gltf.animations.forEach((animation) => {
            const action = mixer.clipAction(animation);
            action.timeScale = this.animationStep * 100
            action.setLoop(LoopOnce, 1)
            action.play();
        });
        mixer.addEventListener('finished', () => onFinished());
        this.mixers.push(mixer)
    }

    render() {
        this.renderer.render(this.scene, this.camera)
    }

    updateScene() {
        this.render()
        if (this.pauseAnimation) {
            if (this.animationStep !== 0) this.initialAnimationStep = this.animationStep
            this.animationStep = 0
        } else {
            if (this.animationStep === 0) this.animationStep = this.initialAnimationStep
            if (this.mixers) this.mixers.forEach((mixer) => mixer.update(1))
        }

        this.animationDriver += this.animationStep

        if (!this.pauseCameraFly) {
            this.flyControls.movementSpeed = this.movementAcceleration
            this.flyControls.update(1);
        }
    }

    runAnimation(animation) {
        requestAnimationFrame(() => {
            animation()
            this.updateScene()
            requestAnimationFrame(() => this.runAnimation(animation))
        })
    }
}