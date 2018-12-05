import { ViewManager } from './viewManager';
import { Mesh } from './three/Mesh';
import { buildCube } from './builder';

let view = new ViewManager();
let cube: Mesh = buildCube([1, 1, 1], 0x123321);


view.addMesh(cube);

view.registerCallback((seconds) => {
    cube.rotate([Math.sin(seconds) / 20, Math.cos(seconds) / 30, 0]);
});

view.start();
