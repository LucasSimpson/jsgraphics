import * as THREE from "three";
import { TRenderer } from './models';
import { Camera, Scene } from './object3D';

export class Renderer {
    private renderer: TRenderer;

    constructor() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
        document.body.appendChild(this.renderer.domElement);
    }

    render(sceneManager: Scene, camera: Camera) {
        this.renderer.render(sceneManager.getAsset(), camera.getAsset());
    }
}