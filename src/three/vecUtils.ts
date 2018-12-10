import { Vec3 } from './models';

export const add = (x: Vec3, y: Vec3): Vec3 => {
    return [x[0] + y[0], x[1] + y[1], x[2] + y[2]];
};

export const sub = (x: Vec3, y: Vec3): Vec3 => {
    return [x[0] - y[0], x[1] - y[1], x[2] - y[2]];
};

export const scale = (x: Vec3, s: number): Vec3 => {
    return [x[0] * s, x[1] * s, x[2] * s];
};

export const mag = (x: Vec3): number => {
    return Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2]);
};
