import { Color, Vec3 } from './three/models';
import * as THREE from "three";
import { Mesh } from './three/object3D';

export const buildCube = (size: Vec3, color: Color): Mesh => {
    let geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
    let material = new THREE.MeshLambertMaterial({color: color});

    return new Mesh(geometry, material);
};