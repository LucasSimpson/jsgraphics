import { Renderer } from './three/renderer';
import { TClock, TObject3D } from './three/models';
import * as THREE from 'three';
import { Camera, Object3D, Scene } from './three/object3D';

export class ViewManager {
    private callbacks: Array<(time: number, deltaTime: number) => void>;
    private clock: TClock;
    private elapsedTime: number;

    private renderer: Renderer;
    private scene: Scene;
    private camera: Camera;

    registerCallback(func: (time: number, deltaTime: number) => void) {
        this.callbacks.push(func);
    }

    constructor() {
        this.callbacks = [];
        this.clock = new THREE.Clock();
        this.elapsedTime = 0;

        this.renderer = new Renderer();
        this.scene = new Scene();
        this.camera = new Camera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

        this.camera.setPosition([0, 0, 50]);
    }

    addChild<T extends TObject3D>(obj: Object3D<T>): void {
        this.scene.addChild(obj);
    }

    start() {
        let animate = () => {
            requestAnimationFrame(animate);

            let deltaTime = this.clock.getDelta();
            this.elapsedTime += deltaTime;
            this.callbacks.forEach(f => f(this.elapsedTime, deltaTime));

            this.renderer.render(this.scene, this.camera);
        };

        this.clock.start();
        animate();
    }
}