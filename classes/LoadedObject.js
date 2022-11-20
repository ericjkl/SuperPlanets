
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
/**
 * @field {Object} ref - reference to the Three.js Mesh object of the planet
 */
export default class LoadedObject {
    /**
     * @param {Object} config - see Planet.js
     * @param {function} onLoad - is called after onLoad of GLTFLoader
     */
    constructor(config, onLoad) {
        const loader = new GLTFLoader();
        loader.load(config.gltfPath, (gltf) => {
            this.ref = gltf.scene
            this.ref.traverse(function (node) {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true; //maybe not needed
                }
            });
            this.gltf = gltf
            onLoad()
        }, null, (error) => { console.error(error) });
    }
}