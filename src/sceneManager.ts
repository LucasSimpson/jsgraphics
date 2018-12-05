import * as THREE from 'three';


type Scene = any;

export class SceneManager {
    private scene: Scene;

    constructor() {
        this.scene = new THREE.Scene();
    }

    add(obj: any) {
        this.scene.add(obj);
    }

    getScene(): Scene {
        return this.scene;
    }
}

