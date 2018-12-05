import { TCamera } from './models';
import * as THREE from "three";

export class Camera {
    private camera: TCamera;

    constructor(fov: number, aspectRatio: number, nearPlane: number, farPlane: number) {
        this.camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane);
    }

    setPosition(x: number, y: number, z: number) {
        this.camera.position.x = x;
        this.camera.position.y = y;
        this.camera.position.z = z;
    }

    getTCamera() {
        return this.camera;
    }
}