import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { AnimationMixer, LoopOnce } from "three";

/**
 * @field {Object} scene - reference to the ThreeJS scene, main parent for all objects
 * @field {Object} camera - main camera
 * @field {Object} renderer - ThreeJS renderer
 * @field {Object} flyControls - ThreeJS flyControls
 * @field {boolean} pauseCameraFly - when true, flyControls are not updated on render
 * @field {boolean} pauseAnimation - when true, animationDriver is not updated on render
 * @field {number} animationDriver - animations are played forward based on this value
 * @field {number} animationStep - animationDriver is increased by this value on every render, defines the speed of animations
 * @field {number} initialAnimationStep - default animation step for restoring initial animation speed
 * @field {number} meteoriteAmount - amount of comets generated in the scene
 * @field {function} onMeteoriteAmountChange - called once the user sets a new meteoriteAmount by changing the slider value in the settings
 * @field {number} ambientLightingBrightness - defining the brightness of the ambient light in the scene
 * @field {function} onAmbientLightingBrightnessChange - called once the user sets a new ambientLightBrightness by changing the slider value in the settings
 * @field {number} movementAcceleration - value defining the current acceleration factor for camera movements
 * @field {Array} mixers - ThreeJS Animation mixers
 * @field {boolean} spaceshipActive - when true, the spaceship is shown and acceleration effects are applied on the camera movements
 * @field {boolean} moveFor - updated once the user presses the W key
 * @field {boolean} moveBack - updated once the user presses the S key
 * @field {boolean} moveLeft - updated once the user presses the A key
 * @field {boolean} moveRight - updated once the user presses the D key
 */
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
        this.meteoriteAmount = 30
        this.onMeteoriteAmountChange = null;
        this.ambientLightingBrightness = 100;
        this.onAmbientLightingBrightnessChange = null;
        this.movementAcceleration = Control.#getInitialMovementAcceleration()
        this.mixers = [];
        this.#addListeners()
        this.spaceshipActive = false;
        this.moveFor = false;
        this.moveBack = false;
        this.moveLeft = false;
        this.moveRight = false;
    }

    /**
     * @returns {number} initialAnimationStep
     */
    static #getInitialAnimationStep() { return 0.005 }

    /**
     * @returns {number} initialMovementAcceleration
     */
    static #getInitialMovementAcceleration() { return 0.5 }

    /**
     * @returns {Object} camera - provides camera to be stored as {this.camera} reference
     */
    static #getCamera() {
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.y = 0;
        camera.position.x = -180;
        camera.position.z = 335;
        camera.rotation.y = -0.8;

        return camera
    }

    /**
     * @returns {Object} renderer - provides camera to be stored as {this.renderer} reference
     */
    static #getRenderer() {
        const renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#bg'),
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true
        return renderer
    }

    /**
     * @returns {undefined}
     * adds event listeners
     */
    #addListeners() {
        window.onkeydown = (event) => {
            if (event.code === "KeyW") {
                this.moveFor = true;
            }
            if (event.code === "KeyS") {
                this.moveBack = true;
            }
            if (event.code === "KeyA") {
                this.moveLeft = true;
            }
            if (event.code === "KeyD") {
                this.moveRight = true;
            }

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
            if (event.code === "KeyP") {
                this.pauseCameraFly = false
                this.spaceshipActive = !this.spaceshipActive
            }
            if (this.spaceshipActive &&
                (event.code === "KeyW" ||
                event.code === "KeyA" ||
                event.code === "KeyS" ||
                event.code === "KeyD")) {
                this.movementAcceleration += Control.#getInitialMovementAcceleration() * (1 / this.movementAcceleration * 10) * 0.05
            }
        }

        window.onkeyup = (event) => {
            if (event.code === "KeyW" ||
                event.code === "KeyA" ||
                event.code === "KeyS" ||
                event.code === "KeyD") {
                this.movementAcceleration = Control.#getInitialMovementAcceleration()
            }

            if (event.code === "KeyW") {
                this.moveFor = false;
            }
            if (event.code === "KeyS") {
                this.moveBack = false;
            }
            if (event.code === "KeyA") {
                this.moveLeft = false;
            }
            if (event.code === "KeyD") {
                this.moveRight = false;
            }
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
            this.meteoriteAmount = (meteoriteAmountSlider.value) ** 1.5 + 50
            this.onMeteoriteAmountChange()
        }

        const ambientBrightnessSlider = document.getElementById("ambientBrightnessSlider")
        ambientBrightnessSlider.oninput = () => {
            const factor = ambientBrightnessSlider.value
            this.ambientLightingBrightness = factor > 1 ? factor ** 4 : factor
            this.onAmbientLightingBrightnessChange()
        }
    }

    /**
     * @param {Object} gltfObj - gltf loaded object containing animations to play
     * @param {function} onFinished - called once the animation is finished
     * @returns {undefined}
     */
    addMixer(gltfObj, onFinished) {
        console.log("adding mixer")
        const mixer = new AnimationMixer(gltfObj.ref)
        gltfObj.gltf.animations.forEach((animation) => {
            const action = mixer.clipAction(animation);
            action.timeScale = this.animationStep * 100
            action.setLoop(LoopOnce, 1)
            action.play();
        })
        mixer.addEventListener('finished', () => onFinished());
        this.mixers.push(mixer)
    }

    /**
     * @returns {undefined}
     * renders the scene once
     */
    render() {
        this.renderer.render(this.scene, this.camera)
    }

    /**
     * @returns {undefined}
     * updates all relevant values for animations and the camera and renders the scene
     */
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

    /**
     * @returns {undefined}
     * starts the animation loop
     */
    runAnimation(animation) {
        requestAnimationFrame(() => {
            animation()
            this.updateScene()
            requestAnimationFrame(() => this.runAnimation(animation))
        })
    }
}