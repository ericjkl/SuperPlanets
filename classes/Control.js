import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";

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
        this.meteoriteAmount = 20
        this.onMeteoriteAmountChange = null;
        this.ambientLightingBrightness = 1;
        this.onAmbientLightingBrightnessChange = null;
        this.#addListeners()
        this.spaceShipId = 0;
        this.spaceShipAktivated = false;
    }

    static #getInitialAnimationStep() { return 0.005 }

    static #getCamera() {
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.setZ(80);
        camera.position.setX(10);
        camera.position.y = 10;
        camera.position.x = 70;
        camera.position.z = 40;
        camera.rotation.y = 0.1;
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
            if (event.code === "KeyC") {
                this.pauseCameraFly = !this.pauseCameraFly
            }
            if (event.code === "KeyX") {
                const settingsStyle = document.getElementById("settings").style
                if (settingsStyle.display === "none") {
                    settingsStyle.display = "block"
                } else {
                    settingsStyle.display = "none"
                }
            }
            if (event.code === "Space") {
                this.pauseAnimation = !this.pauseAnimation
            }
            if (event.code === "KeyB") {
                console.log(this.scene)
                this.pauseCameraFly = false
                if (this.spaceShipAktivated == false) {
                    for (let i = 0; i < this.scene.children.length; i++) {
                        if (this.scene.children[i].name == "Scene") {
                            this.spaceShipId = i;
                        }
                    }
                    console.log("spaceID: " + this.spaceShipId);
                    this.spaceShipAktivated = true;
                    this.camera.position.z = this.scene.children[this.spaceShipId].position.z + 30
                    this.camera.position.y = this.scene.children[this.spaceShipId].position.y + 10
                    this.camera.position.x = this.scene.children[this.spaceShipId].position.x
                }

                else {
                    this.spaceShipAktivated = false;
                }
            }
        };

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
            console.log(factor)
            this.ambientLightingBrightness = factor > 1 ? factor ** 4 : factor
            this.onAmbientLightingBrightnessChange()
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera)
    }

    updateScene() {
        this.render()

        this.animationStep = this.pauseAnimation ? 0 : Control.#getInitialAnimationStep()
        this.animationDriver += this.animationStep

        if (!this.pauseCameraFly) {
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