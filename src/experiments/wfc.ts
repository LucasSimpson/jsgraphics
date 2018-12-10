import { ViewManager } from '../viewManager';
import { Mesh } from '../three/object3D';
import { buildCube } from '../builder';


export const run = () => {

    let view = new ViewManager();
    view.enableFlying(1);
    view.basicLighting();

    // view.addChild(buildCube([30, 30, 30], 0xdddddd));

    let black = 0x111111;
    let white = 0xeeeeee;
    let sample: ColorGrid = [
        [black, white, black],
        [white, black, white],
        [black, white, black],
    ];

    let pg1: PixelGrid = PixelGrid.fromColorGrid(sample, view, -5, -5, 4);

    // view.registerCallback((time, delta) => {
    //
    // });

    view.start();
};


type ColorGrid = Array<Array<number>>;

class PixelGrid {
    private boxes: Array<Array<Mesh>>;

    constructor(vm: ViewManager, x: number, y: number, sx: number, sy: number, scale: number) {
        this.boxes = [];

        for (let i = 0; i < sx; i++) {
            this.boxes.push([]);

            for (let j = 0; j < sy; j++) {
                let cube = buildCube([scale, scale, scale], 0xe7e9e5);
                cube.setPosition([
                    i * scale + x,
                    j * scale + y,
                    0,
                ]);

                this.boxes[i].push(cube);
                vm.addChild(cube);
            }
        }
    }

    static fromColorGrid(cg: ColorGrid, vm: ViewManager, x: number, y: number, scale: number): PixelGrid {
        let pg = new PixelGrid(vm, x, y, cg.length, cg[0].length, scale);

        for (let i = 0; i < cg.length; i++) {
            for (let j = 0; j < cg[i].length; j++) {
                pg.boxes[i][j].setColor(cg[i][j]);
            }
        }

        return pg;
    }

    setColor(x: number, y: number, color: number) {
        this.boxes[x][y].setColor(color);
    }
}

