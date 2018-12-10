import { Renderer } from './three/renderer';
import { TClock, TObject3D, Vec3 } from './three/models';
import * as THREE from 'three';
import { AmbientLight, Camera, Object3D, PointLight, Scene } from './three/object3D';

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

    enableFlying(flySpeed: number) {
        document.onkeydown = (e) => {
            // movement
            let moveVector: Vec3 = [0, 0, 0];

            if (e.which === 65) {  // a
                moveVector[0] -= flySpeed;
            }
            if (e.which === 68) {  // d
                moveVector[0] += flySpeed;
            }

            if (e.which === 87) {  // w
                moveVector[1] += flySpeed;
            }
            if (e.which === 83) {  // s
                moveVector[1] -= flySpeed;
            }

            if (e.which === 81) {  // q
                moveVector[2] += flySpeed;
            }
            if (e.which === 69) {  // e
                moveVector[2] -= flySpeed;
            }
            this.camera.move(moveVector);

            // looking
            let rotVector: Vec3 = [0, 0, 0];

            if (e.which === 38) {  // up
                rotVector[0] += 0.01;
            }
            if (e.which === 40) {  // down
                rotVector[0] -= 0.01;
            }

            if (e.which === 37) {  // left
                rotVector[1] += 0.01;
            }
            if (e.which === 39) {  // right
                rotVector[1] -= 0.01;
            }
            this.camera.rotate(rotVector);
        };
    }

    basicLighting() {
        let light: PointLight = new PointLight([30, 30, 30], 0x969696, 2);
        let amLight: AmbientLight = new AmbientLight(0xe6e7e6, 1);
        this.addChild(light);
        this.addChild(amLight);
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