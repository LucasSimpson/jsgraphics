/** UTIL TYPES **/

export type Vec3 = [number, number, number];

export type Color = number;

/** THREE JS TYPES **/

type TVec3 = {
    x: number,
    y: number,
    z: number,
};

export type TRenderer = {
    render: (scene: TScene, camera: TCamera) => void,
    domElement: any,
    setSize: (w: number, h: number) => void,
};

export type TScene = {
    add: (mesh: TMesh) => void,
};

export type TCamera = {
    position: TVec3,
};

export type TMesh = {
    rotation: TVec3,
    position: TVec3,
};

export type TGeometry = {};
export type TMaterial = {};
