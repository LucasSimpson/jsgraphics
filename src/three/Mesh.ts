import { TGeometry, TMaterial, TMesh, Vec3 } from './models';
import * as THREE from "three";

export class Mesh {
    private mesh: TMesh;

    constructor(geometry: TGeometry, material: TMaterial) {
        this.mesh = new THREE.Mesh(geometry, material)
    }

    rotate(rotation: Vec3) {
        this.mesh.rotation.x += rotation[0];
        this.mesh.rotation.y += rotation[1];
        this.mesh.rotation.z += rotation[2];
    }

    setRotation(rotation: Vec3) {
        this.mesh.rotation.x = rotation[0];
        this.mesh.rotation.y = rotation[1];
        this.mesh.rotation.z = rotation[2];
    }

    move(direction: Vec3) {
        this.mesh.position.x += direction[0];
        this.mesh.position.y += direction[1];
        this.mesh.position.z += direction[2];
    }

    getTMesh(): TMesh {
        return this.mesh;
    }
}