import * as THREE from 'three';
import { TScene } from './models';
import { Mesh } from './Mesh';

export class Scene {
    private scene: TScene;

    constructor() {
        this.scene = new THREE.Scene();
    }

    add(mesh: Mesh) {
        this.scene.add(mesh.getTMesh());
    }

    getTScene(): TScene {
        return this.scene;
    }
}

