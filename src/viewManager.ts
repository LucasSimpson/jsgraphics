import { Renderer } from './three/renderer';
import { Camera } from './three/camera';
import { Scene } from './three/scene';
import { Mesh } from './three/Mesh';

export class ViewManager {
    private callbacks: Array<(time: number) => void>;
    private startTime: number;

    private renderer: Renderer;
    private scene: Scene;
    private camera: Camera;

    registerCallback(func: (time: number) => void) {
        this.callbacks.push(func);
    }

    constructor() {
        this.callbacks = [];

        this.renderer = new Renderer();
        this.scene = new Scene();
        this.camera = new Camera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

        this.camera.setPosition(0, 0, 5);
    }

    addMesh(mesh: Mesh): void {
        this.scene.add(mesh);
    }

    start() {
        let animate = () => {
            requestAnimationFrame(animate);

            let seconds = (new Date().getTime() - this.startTime) / 1000;
            this.callbacks.forEach(f => f(seconds));

            this.renderer.render(this.scene, this.camera);
        };

        this.startTime = new Date().getTime();
        animate();
    }
}