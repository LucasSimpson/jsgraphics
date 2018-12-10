import { HexColor, TGeometry, TMaterial, Vec3 } from './three/models';
import * as THREE from "three";
import { Line, Mesh } from './three/object3D';

export const buildCube = (size: Vec3, color: HexColor): Mesh => {
    let geometry: TGeometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
    let material: TMaterial = new THREE.MeshLambertMaterial({color: color});

    return new Mesh(geometry, material);
};

export const buildLine = (start: Vec3, end: Vec3, color: HexColor): Line => {
    let material = new THREE.LineBasicMaterial({color: color});
    let geometry = new THREE.Geometry();

    geometry.vertices.push(
        new THREE.Vector3(start[0], start[1], start[2]),
        new THREE.Vector3(end[0], end[1], end[2]),
    );

    return new Line(geometry, material);
};
