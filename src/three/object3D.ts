import { HexColor, TCamera, TGeometry, TLight, TLine, TMaterial, TMesh, TObject3D, TScene, Vec3 } from './models';
import * as THREE from "three";
import { Color } from './color';

export class ThreeJSWrapper<T> {
    protected asset: T;

    getAsset(): T {
        return this.asset;
    }

    setAsset(asset: T) {
        this.asset = asset;
    }
}

export class Object3D<T extends TObject3D> extends ThreeJSWrapper<T>{
    protected asset: T;

    rotate(rotation: Vec3): Object3D<T> {
        this.asset.rotation.x += rotation[0];
        this.asset.rotation.y += rotation[1];
        this.asset.rotation.z += rotation[2];
        return this;
    }

    setRotation(rotation: Vec3): Object3D<T> {
        this.asset.rotation.x = rotation[0];
        this.asset.rotation.y = rotation[1];
        this.asset.rotation.z = rotation[2];
        return this;
    }

    move(direction: Vec3): Object3D<T> {
        this.asset.position.x += direction[0];
        this.asset.position.y += direction[1];
        this.asset.position.z += direction[2];
        return this;
    }

    setPosition(position: Vec3): Object3D<T> {
        this.asset.position.x = position[0];
        this.asset.position.y = position[1];
        this.asset.position.z = position[2];
        return this;
    }

    addChild<S extends TObject3D>(obj: Object3D<S>) {
        this.asset.add(obj.getAsset());
    }
}

export class Scene extends Object3D<TScene> {
    constructor() {
        super();
        this.asset = new THREE.Scene();
    }
}

export class Mesh extends Object3D<TMesh> {
    constructor(private geometry: TGeometry, private material: TMaterial) {
        super();
        this.asset = new THREE.Mesh(geometry, material)
    }

    setColor(color: Color) {
        this.material.color.set(color.getAsset());
    }

    setVisibility(visibility: boolean) {
        this.asset.visible = visibility;
    }
}

export class Line extends Object3D<TLine> {
    constructor(private geometry: TGeometry, private material: TMaterial) {
        super();
        this.asset = new THREE.Line(geometry, material)
    }

    setVisibility(visibility: boolean) {
        this.asset.visible = visibility;
    }
}

export class Camera extends Object3D<TCamera>{
    constructor(fov: number, aspectRatio: number, nearPlane: number, farPlane: number) {
        super();
        this.asset = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane);
    }
}

export class PointLight extends Object3D<TLight> {
    constructor(position: Vec3, color: HexColor, intensity: number) {
        super();
        this.asset = new THREE.PointLight(color, intensity, 1000, 2);
        this.setPosition(position);
    }
}

export class AmbientLight extends Object3D<TLight> {
    constructor(color: HexColor, intensity: number) {
        super();
        this.asset = new THREE.AmbientLight(color, intensity);
    }
}

