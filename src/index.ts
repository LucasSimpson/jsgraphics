import { ViewManager } from './viewManager';
import { buildCube } from './builder';
import { AmbientLight, Mesh, PointLight } from './three/object3D';

let view = new ViewManager();

let light: PointLight = new PointLight([30, 30, 30], 0x969696, 2);
let amLight: AmbientLight = new AmbientLight(0xe6e7e6, 1);
view.addChild(light);
view.addChild(amLight);


for (let i = 0; i < 1000; i++) {
    let cube: Mesh = buildCube([Math.random() * 4, Math.random() * 4, Math.random() * 4,], 0x699669);
    cube.setPosition([Math.random() * 80 - 40, Math.random() * 80 - 40, Math.random() * 80 - 40]);
    cube.setRotation([Math.random() * 80 - 40, Math.random() * 80 - 40, Math.random() * 80 - 40]);
    view.addChild(cube);
    view.registerCallback((elapsedTime, delta) => {
        cube.rotate([Math.sin(elapsedTime) / 20, Math.cos(elapsedTime) / 30, 0]);
    });
}

view.start();
