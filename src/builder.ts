import { Color, Vec3 } from './three/models';
import { Mesh } from './three/Mesh';
import * as THREE from "three";

export const buildCube = (size: Vec3, color: Color): Mesh => {
    let geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
    let material = new THREE.MeshBasicMaterial({color: color});
    let mesh = new Mesh(geometry, material);

    return mesh;
};