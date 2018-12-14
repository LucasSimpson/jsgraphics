import { ViewManager } from '../viewManager';
import { buildLine } from '../builder';
import { Vec3 } from '../three/models';



const polarToCartesian = (theta: number, r: number): Vec3 => {
    return [r * Math.sin(theta), r * Math.cos(theta), 0];
};

export const run = () => {

    let view = new ViewManager();
    view.enableFlying(1);
    view.basicLighting();

    let numPoints: number = 3000;
    let b: number = 0.5;
    let dist: number = 0.1;

    let theta: number = 0;

    for (let i = 0; i < numPoints; i++) {

        // build new point
        let new_t = Math.sqrt(
            (2 * dist) / b + theta * theta
        );

        // draw line segment
        view.addChild(buildLine(
            polarToCartesian(theta, b * theta),
            polarToCartesian(new_t, b * new_t),
            0xeeeeee,
        ));

        // update theta
        theta = new_t;
    }

    view.start();
};

