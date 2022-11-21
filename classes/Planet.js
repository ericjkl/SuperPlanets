import * as THREE from "three";
import LoadedObject from "./LoadedObject";

/**
 * @field {Object} ref - reference to the Three.js Mesh object of the planet
 * @field {Object} gltf - gltf object if loaded from gltf file
 */
export default class Planet {

    /**
     * @param {Object} config - create new planet object from config information or load from a gltf file
     * @param {string} [config.gltfPath] - path to load gltf/glb file from; if this field is given the planet is constructed from this file
     * @param {number} [config.initialScale] - radius of planet; only applicable for gltf objects
     * @param {number} [config.radius] - radius of planet
     * @param {string} [config.mapPath] - path to texture map to apply on planet
     * @param {string} [config.normalMapPath] - path to texture normal map to apply on planet
     * @param {number} [config.segmentCount = 32] - amount of triangle segments the planet consists of
     * @param {boolean} [config.castShadow = false] - defining if the planet should cast shadows
     * @param {boolean} [config.receiveShadow = false] - defining if the planet should receive shadows
     * @param {{x: number, y: number, z: number}} [config.initialPosition] - initial x,y,z
     *
     * @param {Object} [scene] - Three.js scene object to add the planet to
     * @param {function} [onGLTFLoaded] - callback executed when GLTF object was loaded
     */
    constructor(config, scene, onGLTFLoaded) {
        if (config.gltfPath) {
            this.#loadGLTF(config, () => {
                this.#setupObject(config, scene)
                if (onGLTFLoaded) onGLTFLoaded()
            })
        } else {
            this.#createFromConfig(config)
            this.#setupObject(config, scene)
        }
    }

    #loadGLTF(config, onLoad) {
        const gltfObject = new LoadedObject(config, () => {
            this.ref = gltfObject.ref
            this.gltf = gltfObject.gltf
            onLoad()
        })
    }

    #createFromConfig(config) {
        const map = config.mapPath ? new THREE.TextureLoader().load(config.mapPath) : null;
        const normalMap = config.normalMapPath ? new THREE.TextureLoader().load(config.normalMapPath) : null;

        const segments = config.segmentCount || 32
        const Material = config.material || THREE.MeshPhongMaterial
        this.ref = new THREE.Mesh(
            new THREE.SphereGeometry(config.radius, segments, segments),
            new Material({
                map: map,
                normalMap: normalMap,
            })
        );
    }

    #setupObject(config, scene) {
        if (config.castShadow) this.ref.castShadow = config.castShadow;
        if (config.receiveShadow) this.ref.receiveShadow = config.receiveShadow;
        if (config.initialPosition) {
            this.ref.position.x = config.initialPosition.x
            this.ref.position.y = config.initialPosition.y
            this.ref.position.z = config.initialPosition.z
        }
        if (config.initialScale) {
            this.ref.scale.x = config.initialScale
            this.ref.scale.y = config.initialScale
            this.ref.scale.z = config.initialScale
        }
        if (scene) scene.add(this.ref)
    }
}