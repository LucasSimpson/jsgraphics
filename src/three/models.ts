/** UTIL TYPES **/

export type Vec3 = [number, number, number];

export type Color = number;

/** THREE JS TYPES **/

type TVec3 = {
    x: number,
    y: number,
    z: number,
};

export type TObject3D = {
    position: TVec3,
    rotation: TVec3,
    add: (obj: TObject3D) => void,
};

export type TRenderer = {
    render: (scene: TScene, camera: TCamera) => void,
    domElement: any,
    setSize: (w: number, h: number) => void,
};

export type TScene = TObject3D & {};

export type TCamera = TObject3D & {};

export type TLight = TObject3D & {};

export type TMesh = TObject3D & {};

export type TGeometry = {};

export type TMaterial = {};

export type TClock = {
    start: () => void,
    getDelta: () => number,
};
