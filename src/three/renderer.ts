import * as THREE from "three";
import { Scene } from './scene';
import { TRenderer } from './models';
import { Camera } from './camera';

export class Renderer {
    private renderer: TRenderer;

    constructor() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
        document.body.appendChild(this.renderer.domElement);
    }

    render(sceneManager: Scene, camera: Camera) {
        this.renderer.render(sceneManager.getTScene(), camera.getTCamera());
    }
}