import { Color, TCamera, TGeometry, TLight, TMaterial, TMesh, TObject3D, TScene, Vec3 } from './models';
import * as THREE from "three";

export class Object3D<T extends TObject3D> {
    protected asset: T;

    rotate(rotation: Vec3) {
        this.asset.rotation.x += rotation[0];
        this.asset.rotation.y += rotation[1];
        this.asset.rotation.z += rotation[2];
    }

    setRotation(rotation: Vec3) {
        this.asset.rotation.x = rotation[0];
        this.asset.rotation.y = rotation[1];
        this.asset.rotation.z = rotation[2];
    }

    move(direction: Vec3) {
        this.asset.position.x += direction[0];
        this.asset.position.y += direction[1];
        this.asset.position.z += direction[2];
    }

    setPosition(position: Vec3) {
        this.asset.position.x = position[0];
        this.asset.position.y = position[1];
        this.asset.position.z = position[2];
    }

    addChild<S extends TObject3D>(obj: Object3D<S>) {
        this.asset.add(obj.getAsset());
    }

    getAsset(): T {
        return this.asset;
    }
}

export class Scene extends Object3D<TScene> {
    constructor() {
        super();
        this.asset = new THREE.Scene();
    }
}

export class Mesh extends Object3D<TMesh> {
    constructor(geometry: TGeometry, material: TMaterial) {
        super();
        this.asset = new THREE.Mesh(geometry, material)
    }
}

export class Camera extends Object3D<TCamera>{
    constructor(fov: number, aspectRatio: number, nearPlane: number, farPlane: number) {
        super();
        this.asset = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane);
    }
}

export class PointLight extends Object3D<TLight> {
    constructor(position: Vec3, color: Color, intensity: number) {
        super();
        this.asset = new THREE.PointLight(color, intensity, 1000, 2);
        this.setPosition(position);
    }
}

export class AmbientLight extends Object3D<TLight> {
    constructor(color: Color, intensity: number) {
        super();
        this.asset = new THREE.AmbientLight(color, intensity);
    }
}

