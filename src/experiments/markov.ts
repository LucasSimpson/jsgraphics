import { ViewManager } from '../viewManager';
import { Vec3 } from '../three/models';
import { buildLine } from '../builder';
import { add, mag, scale } from '../three/vecUtils';


export const run = () => {

    let view = new ViewManager();
    view.enableFlying(1);

    let speed: number = 20;
    let position: Vec3 = [0, 0, 0];

    let previousPositions: Array<Vec3> = [];

    view.registerCallback((time, delta) => {
        let newPosition: Vec3 = [
            position[0] + (Math.random() * 2 - 1) * delta * speed,
            position[1] + (Math.random() * 2 - 1) * delta * speed,
            position[2] + (Math.random() * 2 - 1) * delta * speed,
        ];

        view.addChild(buildLine(position, newPosition, 0xdddddd));

        previousPositions.push(position);
        position = newPosition;

        // calc some staaats
        if (previousPositions.length > 2) {
            let summedPosition: Array<Vec3> = [previousPositions[previousPositions.length - 1]];
            for (let i = previousPositions.length - 2; i > 0; i--) {
                summedPosition.push(add(
                    previousPositions[i],
                    summedPosition[summedPosition.length - 1]
                ));
            }

            let aveDistances = summedPosition.map((vec, i) => mag(vec) / (i + 1) / (i + 1));

            let GA = aveDistances.reduce((a, b) => a + b, 0) / aveDistances.length;
            console.log(GA);
        }
    });

    view.start();
};


